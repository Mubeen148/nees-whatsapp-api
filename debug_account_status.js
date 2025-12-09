import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const { CLOUD_API_ACCESS_TOKEN, WA_PHONE_NUMBER_ID } = process.env;

const debugAccount = async () => {
    try {
        console.log('--- Debugging Account Status ---');
        // WABA ID for "Nees Internnational"
        const WABA_ID = '1867529220642023';

        // 1. Check WABA Basics (Removed invalid 'payment_method_attached')
        console.log(`Checking WABA ID: ${WABA_ID}`);
        const wabaRes = await axios.get(`https://graph.facebook.com/v21.0/${WABA_ID}`, {
            headers: { Authorization: `Bearer ${CLOUD_API_ACCESS_TOKEN}` },
            params: {
                fields: 'id,name,currency,account_review_status,message_template_namespace'
            }
        });

        console.log('\n[WABA Details]');
        console.log(JSON.stringify(wabaRes.data, null, 2));

        // 2. Check Phone Number Status (To see if it is still EXPIRED)
        console.log(`\nChecking Phone ID: ${WA_PHONE_NUMBER_ID}`);
        const phoneRes = await axios.get(`https://graph.facebook.com/v21.0/${WA_PHONE_NUMBER_ID}`, {
            headers: { Authorization: `Bearer ${CLOUD_API_ACCESS_TOKEN}` },
            params: { fields: 'id, quality_rating, code_verification_status, account_mode' }
        });

        console.log('\n[Phone Status]');
        const status = phoneRes.data.code_verification_status;
        console.log(`Verification Status: ${status}`);

        if (status === 'EXPIRED' || status === 'NOT_VERIFIED') {
            console.log('\n[ACTION REQUIRED]: Phone verification is EXPIRED. You MUST click "Verify" in the Dashboard.');
        } else {
            console.log('\n[GOOD]: Phone is verified.');
        }

    } catch (error) {
        console.error('\n[API Error]', error.response ? error.response.data : error.message);
    }
};

debugAccount();
