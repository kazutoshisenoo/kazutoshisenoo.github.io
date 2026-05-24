// ==========================================
// お問い合わせ自動返信機能の設定（EmailJSを使用する場合）
// ==========================================
// 無料で自動返信メールを送信したい場合は、EmailJS（https://www.emailjs.com/）に登録し、
// 以下の設定値を入力してください。設定されていない場合は、Formspreeへの送信のみが行われます。
const EMAILJS_PUBLIC_KEY = '';  // 例: 'user_xxxxxxxxxxxxxx'
const EMAILJS_SERVICE_ID = '';  // 例: 'service_xxxxxxx'
const EMAILJS_TEMPLATE_ID = ''; // 例: 'template_xxxxxxx'

document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('#nav');
    const navLinks = document.querySelectorAll('#nav a');

    menuBtn.addEventListener('click', function () {
        menuBtn.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            menuBtn.classList.remove('active');
            nav.classList.remove('active');
        });
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for Fade-in Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Form Submission Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = '送信中...';
            submitBtn.disabled = true;

            // Formspree endpoint
            const formAction = 'https://formspree.io/f/xblweapk';

            const formData = new FormData(contactForm);

            fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        // EmailJSによる自動返信メール送信（設定されている場合）
                        if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
                            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                                name: formData.get("name"),
                                email: formData.get("email"),
                                subject: formData.get("subject"),
                                message: formData.get("message")
                            }, EMAILJS_PUBLIC_KEY)
                            .then(() => {
                                console.log('Auto-reply sent successfully.');
                            })
                            .catch((err) => {
                                console.error('Auto-reply failed to send:', err);
                            });
                        }

                        alert('お問い合わせありがとうございます。\nメッセージが送信されました。');
                        contactForm.reset();
                    } else {
                        response.json().then(data => {
                            if (Object.hasOwn(data, 'errors')) {
                                alert('送信エラー: ' + data.errors.map(error => error.message).join(", "));
                            } else {
                                alert('送信中にエラーが発生しました。もう一度お試しください。');
                            }
                        });
                    }
                })
                .catch(error => {
                    alert('送信中にエラーが発生しました。インターネット接続を確認してください。');
                })
                .finally(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});
