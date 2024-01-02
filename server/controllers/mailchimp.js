const mailchimp = require('@mailchimp/mailchimp_marketing');

mailchimp.setConfig({
    apiKey: 'ad40b18daf2b1503d838c65b03ecc09e-us8',
    server: 'us8',
  });

const setSubMailchimp = async (req, res) => {
    try {

        const response = await mailchimp.automations.addWorkflowEmailSubscriber(
            "workflow_id",
            "Julie.Donnelly1@hotmail.com",
            { email_address: "Herminio_Weber29@gmail.com" }
         );
        console.log(response);

        res.status(500).json({
            success: true,
            message: response,
        }) 
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error,
        })
    }
}  

const setSubMailchimpTest = async () => {
    try {
        const response = await mailchimp.automations.addWorkflowEmailSubscriber(
            "workflow_id",
            "Julie.Donnelly1@hotmail.com",
            { email_address: "mattianoris23@gmail.com" }
         );
        console.log(response);

    } catch (error) {
        console.error(error);
    }
}  

exports.getAutomationtest = async () => {
    try {
        const response = await mailchimp.automations.list();
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

