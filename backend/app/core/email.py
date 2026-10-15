import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_temp_password_email(to_email:str,temp_password:str,full_name:str | None = None)-> bool:
    subject = "Your account has been created"
    body = (
        f"Hello {full_name or 'there'},\n\n"
        f"Your account has been created.\n"
        f"Temporary password: {temp_password}\n\n"
        f"You will be asked to change it on first login.\n"
    )

    if settings.ENV == "development" or not settings.SMTP:
        logger.warning(
             "[DEV] Email disabled. Temp password for %s: %s",to_email,temp_password
        )
    return False

    try:
        import smtplib
        from email.message import EmailMessage
        msg =EmailMessage()   
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email
        msg.set_content(body)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(msg)
        return True
    except Exception:
        logger.exception("Faild to send temp password email to %s",to_email)
        return False    