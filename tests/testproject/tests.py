import subprocess
import sys
from pathlib import Path

from django.template import Context, Template
from django.template.loader import render_to_string
from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from click_to_reveal.models import Email


class TestProjectRunnerTests(SimpleTestCase):
    def test_manage_py_without_script_directory_on_python_path(self):
        manage_py = Path(__file__).resolve().parent.parent / "manage.py"
        result = subprocess.run(
            [
                sys.executable,
                "-I",
                "-c",
                'import runpy, sys; sys.argv = [sys.argv[1], "check"]; '
                'runpy.run_path(sys.argv[0], run_name="__main__")',
                str(manage_py),
            ],
            capture_output=True,
            text=True,
        )

        self.assertEqual(result.returncode, 0, result.stderr)


class ClickToRevealTests(TestCase):
    def test_link_text_defaults_to_click_to_reveal(self):
        rendered = Template(
            '{% load click_to_reveal %}{% click_to_reveal email %}'
        ).render(Context({"email": "person@example.com"}))

        self.assertIn(">Click to reveal</a>", rendered)

    def test_homepage_renders_link_without_email_address(self):
        response = self.client.get(reverse("index"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Show email")
        self.assertContains(response, "<script>")
        self.assertNotContains(response, "person@example.com")

        email = Email.objects.get(email="person@example.com")
        self.assertContains(
            response,
            reverse("click_to_reveal:reveal_email", args=[email.pk]),
        )

    def test_reveal_view_returns_email_as_json(self):
        email = Email.objects.create(email="person@example.com")

        response = self.client.get(
            reverse("click_to_reveal:reveal_email", args=[email.pk])
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"email": "person@example.com"})

    def test_reveal_view_returns_404_for_unknown_id(self):
        response = self.client.get(
            reverse("click_to_reveal:reveal_email", args=[999])
        )

        self.assertEqual(response.status_code, 404)
