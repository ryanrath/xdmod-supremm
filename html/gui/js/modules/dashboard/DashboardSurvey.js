Ext.namespace('XDMoD.Module.Dashboard');

XDMoD.Module.Dashboard.Survey = Ext.extend(Ext.Window, {

    constructor: function (config) {
        let self = this;

        this.intro = new Ext.FormPanel(
            {
                autoHeight: true,
                baseCls: 'x-plain',
                items: [
                    {
                        xtype: 'panel',
                        layout: 'form',
                        hideLabels: true,
                        frame: true,
                        width: 430,
                        items: [
                            {
                                xtype: 'label',
                                text: 'Welcome to the Survey!',
                                style: 'padding-left: 30%;padding-bottom: 15px;display: block;'
                            },
                            {
                                xtype: 'label',
                                style: 'display: block; padding-bottom: 10px;',
                                text: '\n' +
                                    'The XMS team would like your help in improving XDMoD. Please take the time to complete this brief survey about XDMoD. The survey should take less than X minutes to complete. Your responses will be used to ...'
                            }
                        ]
                    }
                ]
            }
        );

        this.questions = [
            'Text for Question 1',
            'Text for Question 2',
            'Text for Question 3'
        ];


        this.form = new Ext.FormPanel({
            autoHeight: true,
            baseCls: 'x-plain',
            cls: 'no-underline-invalid-fields-form',
            items: [
                {
                    xtype: 'panel',
                    title: 'Question 1',
                    frame: true,
                    width: 430,
                    hideLabels: true,
                    layout: 'form',
                    items: [
                        {
                            xtype: 'label',
                            text: this.questions[0]
                        },
                        {
                            xtype: 'textarea',
                            anchor: '100%',
                            blankText: 'Your Answer to Question 1'
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    title: 'Question 2',
                    labelWidth: 45,
                    frame: true,
                    width: 430,
                    hideLabels: true,
                    layout: 'form',
                    items: [
                        {
                            xtype: 'label',
                            text: this.questions[1],
                            style: 'margin: 15px 0px'
                        },
                        {
                            xtype: 'textarea',
                            anchor: '100%',
                            blankText: 'Your Answer to Question 2'
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    title: 'Question 3',
                    labelWidth: 45,
                    frame: true,
                    width: 430,
                    layout: 'form',
                    hideLabels: true,
                    items: [
                        {
                            xtype: 'label',
                            text: this.questions[2],
                            style: 'margin: 15px 0px'
                        },
                        {
                            xtype: 'textarea',
                            anchor: '100%',
                            blankText: 'Your Answer to Question 3'
                        }
                    ]
                }
            ]
        });

        let navHandler = function (direction) {
            let current = this.activeItemIndex;
            let next = current + direction;

            if (next > 0) {
                Ext.getCmp('move-prev').setDisabled(false);
            } else {
                Ext.getCmp('move-prev').setDisabled(true);
            }

            if (next + 1 >= this.items.length) {
                Ext.getCmp('move-next').setDisabled(true);
                Ext.getCmp('survey-submit').setDisabled(false);
            } else {
                Ext.getCmp('move-next').setDisabled(false);
                Ext.getCmp('survey-submit').setDisabled(true);
            }

            this.activeItemIndex = next;

            this.getLayout().setActiveItem(next);

            this.syncShadow();
        };

        Ext.apply(this, {
            title: 'XSEDE XDMoD Feedback Survey',
            hidden: true,
            modal: true,
            resizable: false,
            draggable: true,
            width: 455,
            layout: new Ext.layout.CardLayout({
                deferredRender: true,
                layoutOnCardChange: true,
            }),
            activeItem: 0,
            activeItemIndex: 0,
            events: {},
            items: [
                this.intro,
                this.form
            ],
            bbar: {
                items: [
                    {
                        id: 'move-prev',
                        text: 'Back',
                        icon    : '../gui/images/arrow_left.png',
                        handler: navHandler.createDelegate(this, [-1]),
                        disabled: true
                    },
                    '->',
                    {
                        id: 'move-next',
                        text: 'Next',
                        icon    : '../gui/images/arrow_right.png',
                        handler: navHandler.createDelegate(this, [1])
                    },
                    {
                        id: 'survey-submit',
                        text: 'Submit',
                        disabled: true,
                        icon    : '../gui/images/email_go.png',
                        handler: function () {
                            self.submitSurvey();
                            self.close();
                        }
                    },
                    {
                        id: 'survey-cancel',
                        text: 'Cancel',
                        icon    : '../gui/images/close.png',
                        handler: function () {
                            self.recordShown();
                            self.close();
                        }
                    }
                ]
            }
        });

        XDMoD.Module.Dashboard.Survey.superclass.initComponent.apply(this, arguments);
    },

    /**
     * This function will record that the current user has already seen / does not want to complete the survey.
     */
    recordShown: function() {

    },

    /**
     * This function will submit the current users answers to the survey.
     */
    submitSurvey: function() {
        let answers = Object.values(this.form.getForm().getValues());
        let qna = [];
        for (let i = 0; i < answers.length; i++) {
            qna.push({
                question: this.questions[i],
                answer: answers[i]
            });
        }

        let conn = new Ext.data.Connection();
        conn.request({
            url: XDMoD.REST.url + '/surveys',
            params: {
                token: XDMoD.REST.token,
                qna: JSON.stringify(qna)
            },
            method: 'POST',
            callback: function (options, success, rawResponse) {
                let response = Ext.decode(rawResponse.responseText);
                console.log(response);
            }
        });
    }
});

let dashboardInit = function () {
    if (Ext.isDefined(CCR.xdmod.ui.tgSummaryViewer) && !CCR.xdmod.ui.username.includes('public')) {
        /*var conn = new Ext.data.Connection();
        conn.request({
            url: XDMoD.REST.url + '/dashboard/viewedUserTour',
            params: {
                token: XDMoD.REST.token
            },
            method: 'GET',
            callback: function (options, success, rawResponse) {
                let response = Ext.decode(rawResponse.responseText);
                let data = response.hasOwnProperty('data') ? response.data : [];
                let record = data.length > 0 ? data[0] : null;

                // We only want to present the survey to a user that has viewed the tour.
                if (record !== null && record['viewedTour']) {

                    // ensure that some amount of time has passed since viewing the tour before asking the user to fill
                    // out the survey.

                    /!*let lastViewedOn = record['lastViewedOn'];
                    let twoWeeksAgo = new Date();
                    twoWeeksAgo.setDate((new Date()).getDate() - 14);

                    if (lastViewedOn <= twoWeeksAgo) {
                        new XDMoD.Module.Dashboard.Survey().show();
                    }*!/

                }

            }
        });*/
        new XDMoD.Module.Dashboard.Survey().show();
    }
};

Ext.defer(
    dashboardInit,
    2000
);
