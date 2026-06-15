import { LightningElement, track } from 'lwc';
import sendOtp from '@salesforce/apex/PasswordlessLoginService.sendOtp';
import verifyOtp from '@salesforce/apex/PasswordlessLoginService.verifyOtp';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PasswordlessLoginForm extends LightningElement {
    @track email = '';
    @track code = '';
    @track errorMessage = '';
    @track isSending = false;
    @track isVerifying = false;
    @track showOtpSection = false;
    identifier = '';
    startUrl = '';

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleCodeChange(event) {
        this.code = event.target.value;
    }

    async sendOtp() {
        this.errorMessage = '';
        this.isSending = true;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const startUrl = urlParams.get('startURL') || urlParams.get('startUrl') || '/home';
            const result = await sendOtp({ email: this.email, startUrl: startUrl });
            this.identifier = result.identifier;
            this.startUrl = result.startUrl;
            this.showOtpSection = true;
            this.dispatchEvent(new ShowToastEvent({ title: 'OTP Sent', message: 'Check your email for the code.', variant: 'success' }));
        } catch (err) {
            this.errorMessage = err.body ? err.body.message : err.message;
            this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.errorMessage, variant: 'error' }));
        } finally {
            this.isSending = false;
        }
    }

    async verifyOtp() {
        this.errorMessage = '';
        this.isVerifying = true;
        try {
            const result = await verifyOtp({ email: this.email, identifier: this.identifier, code: this.code, startUrl: this.startUrl });
            if (result.success) {
                this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: 'Login verified.', variant: 'success' }));
                // Redirect to the start URL
                window.location.href = result.redirectUrl;
            } else {
                this.errorMessage = 'Invalid code.';
                this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.errorMessage, variant: 'error' }));
            }
        } catch (err) {
            this.errorMessage = err.body ? err.body.message : err.message;
            this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.errorMessage, variant: 'error' }));
        } finally {
            this.isVerifying = false;
        }
    }
}
