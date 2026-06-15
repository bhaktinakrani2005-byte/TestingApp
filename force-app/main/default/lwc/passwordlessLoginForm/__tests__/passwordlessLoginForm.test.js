import { createElement } from 'lwc';
import PasswordlessLoginForm from 'c/passwordlessLoginForm';
import sendOtp from '@salesforce/apex/PasswordlessLoginService.sendOtp';
import verifyOtp from '@salesforce/apex/PasswordlessLoginService.verifyOtp';

jest.mock(
    '@salesforce/apex/PasswordlessLoginService.sendOtp',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/PasswordlessLoginService.verifyOtp',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

describe('c-passwordless-login-form', () => {
    let mockLocation;

    beforeEach(() => {
        mockLocation = { href: '' };
        Object.defineProperty(window, 'location', {
            value: mockLocation,
            configurable: true,
            writable: true
        });
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    function getEmailInput(element) {
        return Array.from(element.shadowRoot.querySelectorAll('lightning-input'))
            .find(input => input.label === 'Email');
    }

    function getOtpInput(element) {
        return Array.from(element.shadowRoot.querySelectorAll('lightning-input'))
            .find(input => input.label === 'OTP Code');
    }

    function getSendButton(element) {
        return Array.from(element.shadowRoot.querySelectorAll('lightning-button'))
            .find(btn => btn.label === 'Send OTP');
    }

    function getVerifyButton(element) {
        return Array.from(element.shadowRoot.querySelectorAll('lightning-button'))
            .find(btn => btn.label === 'Verify');
    }

    it('renders initial email form page', () => {
        const element = createElement('c-passwordless-login-form', {
            is: PasswordlessLoginForm
        });
        document.body.appendChild(element);

        const inputEl = getEmailInput(element);
        expect(inputEl).toBeDefined();
        expect(inputEl.value).toBe('');

        const buttonEl = getSendButton(element);
        expect(buttonEl).toBeDefined();
    });

    it('successfully sends OTP and displays OTP validation section', async () => {
        const element = createElement('c-passwordless-login-form', {
            is: PasswordlessLoginForm
        });
        document.body.appendChild(element);

        sendOtp.mockResolvedValue({ identifier: 'MOCK-123456', startUrl: '/home' });

        let toastDetail = null;
        element.addEventListener('lightning__showtoast', (event) => {
            toastDetail = event.detail;
        });

        const inputEl = getEmailInput(element);
        inputEl.value = 'test@example.com';
        inputEl.dispatchEvent(new CustomEvent('change', { target: { value: 'test@example.com' } }));

        const buttonEl = getSendButton(element);
        buttonEl.click();

        await Promise.resolve(); // wait for sendOtp imperative call
        await Promise.resolve(); // wait for DOM updates

        expect(sendOtp).toHaveBeenCalledTimes(1);
        expect(sendOtp).toHaveBeenCalledWith({ email: 'test@example.com', startUrl: '/home' });

        expect(toastDetail).not.toBeNull();
        expect(toastDetail.title).toBe('OTP Sent');
        expect(toastDetail.variant).toBe('success');

        const otpInputEl = getOtpInput(element);
        expect(otpInputEl).toBeDefined();
    });

    it('displays error if OTP sending fails', async () => {
        const element = createElement('c-passwordless-login-form', {
            is: PasswordlessLoginForm
        });
        document.body.appendChild(element);

        sendOtp.mockRejectedValue({ body: { message: 'User not found' } });

        let toastDetail = null;
        element.addEventListener('lightning__showtoast', (event) => {
            toastDetail = event.detail;
        });

        const inputEl = getEmailInput(element);
        inputEl.value = 'invalid@example.com';
        inputEl.dispatchEvent(new CustomEvent('change', { target: { value: 'invalid@example.com' } }));

        const buttonEl = getSendButton(element);
        buttonEl.click();

        await Promise.resolve();
        await Promise.resolve();

        expect(toastDetail).not.toBeNull();
        expect(toastDetail.title).toBe('Error');
        expect(toastDetail.variant).toBe('error');

        const errorEl = element.shadowRoot.querySelector('.slds-text-color_error');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('User not found');
    });

    it('successfully verifies OTP and redirects user', async () => {
        const element = createElement('c-passwordless-login-form', {
            is: PasswordlessLoginForm
        });
        document.body.appendChild(element);

        sendOtp.mockResolvedValue({ identifier: 'MOCK-123456', startUrl: '/home' });

        const inputEl = getEmailInput(element);
        inputEl.value = 'test@example.com';
        inputEl.dispatchEvent(new CustomEvent('change', { target: { value: 'test@example.com' } }));

        const buttonEl = getSendButton(element);
        buttonEl.click();

        await Promise.resolve();
        await Promise.resolve();

        const otpInputEl = getOtpInput(element);
        otpInputEl.value = '123456';
        otpInputEl.dispatchEvent(new CustomEvent('change', { target: { value: '123456' } }));

        verifyOtp.mockResolvedValue({ success: true, redirectUrl: '/home' });

        const verifyButtonEl = getVerifyButton(element);
        verifyButtonEl.click();

        await Promise.resolve();
        await Promise.resolve();

        expect(verifyOtp).toHaveBeenCalledTimes(1);
        expect(verifyOtp).toHaveBeenCalledWith({
            email: 'test@example.com',
            identifier: 'MOCK-123456',
            code: '123456',
            startUrl: '/home'
        });

        expect(mockLocation.href).toBe('/home');
    });

    it('displays error if OTP verification fails', async () => {
        const element = createElement('c-passwordless-login-form', {
            is: PasswordlessLoginForm
        });
        document.body.appendChild(element);

        sendOtp.mockResolvedValue({ identifier: 'MOCK-123456', startUrl: '/home' });

        const inputEl = getEmailInput(element);
        inputEl.value = 'test@example.com';
        inputEl.dispatchEvent(new CustomEvent('change', { target: { value: 'test@example.com' } }));

        const buttonEl = getSendButton(element);
        buttonEl.click();

        await Promise.resolve();
        await Promise.resolve();

        const otpInputEl = getOtpInput(element);
        otpInputEl.value = 'wrong';
        otpInputEl.dispatchEvent(new CustomEvent('change', { target: { value: 'wrong' } }));

        verifyOtp.mockResolvedValue({ success: false });

        let toastDetail = null;
        element.addEventListener('lightning__showtoast', (event) => {
            toastDetail = event.detail;
        });

        const verifyButtonEl = getVerifyButton(element);
        verifyButtonEl.click();

        await Promise.resolve();
        await Promise.resolve();

        expect(toastDetail).not.toBeNull();
        expect(toastDetail.title).toBe('Error');
        expect(toastDetail.variant).toBe('error');

        const errorEl = element.shadowRoot.querySelector('.slds-text-color_error');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('Invalid code.');
    });
});
