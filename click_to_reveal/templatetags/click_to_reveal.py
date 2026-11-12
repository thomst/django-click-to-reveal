from django import template
from django.urls import reverse

from click_to_reveal.models import Email


register = template.Library()


@register.inclusion_tag("click_to_reveal/link.html")
def click_to_reveal(email: str, text: str = "Click to reveal"):
    email_record, _ = Email.objects.get_or_create(email=email)
    url = reverse("click_to_reveal:reveal_email", args=[email_record.pk])
    return {"url": url, "text": text}
