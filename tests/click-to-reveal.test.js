const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const template = readFileSync(
    join(__dirname, "../click_to_reveal/templates/click_to_reveal/link.html"),
    "utf8",
);
assert.match(template, /<\/a>\s*{% if [^%]+%}\s*<script>/);
const script = template.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeLink(href) {
    return {
        href,
        textContent: "Click to reveal",
        listeners: [],
        addEventListener(type, listener) {
            assert.equal(type, "click");
            this.listeners.push(listener);
        },
        removeEventListener(type, listener) {
            assert.equal(type, "click");
            this.listeners = this.listeners.filter((item) => item !== listener);
        },
    };
}

function renderScripts(links, fetch) {
    const context = vm.createContext({ document: {}, fetch });
    const globals = Object.keys(context);
    for (const link of links) {
        context.document.currentScript = { previousElementSibling: link };
        vm.runInContext(script, context);
    }
    assert.deepEqual(Object.keys(context), globals);
}

async function click(link) {
    let prevented = false;
    for (const listener of link.listeners) {
        listener({ preventDefault() { prevented = true; } });
    }
    await new Promise(setImmediate);
    return prevented;
}

test("each link gets one listener and reveals only its own email", async () => {
    const links = [makeLink("/email/1/"), makeLink("/email/2/")];
    const requests = [];
    renderScripts(links, (url) => {
        requests.push(url);
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                email: url === "/email/1/" ? "first@example.com" : "second@example.com",
            }),
        });
    });

    assert.deepEqual(links.map((link) => link.listeners.length), [1, 1]);
    assert.equal(await click(links[0]), true);
    assert.deepEqual(requests, ["/email/1/"]);
    assert.equal(links[0].textContent, "first@example.com");
    assert.equal(links[0].href, "mailto:first@example.com");
    assert.equal(links[1].textContent, "Click to reveal");
    assert.equal(links[1].href, "/email/2/");
    assert.equal(await click(links[1]), true);
    assert.deepEqual(requests, ["/email/1/", "/email/2/"]);
    assert.equal(links[1].textContent, "second@example.com");
    assert.equal(links[1].href, "mailto:second@example.com");
});

test("clicking a revealed email follows the mailto link without fetching again", async () => {
    const link = makeLink("/email/1/");
    const requests = [];
    renderScripts([link], (url) => {
        requests.push(url);
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ email: "person@example.com" }),
        });
    });

    assert.equal(await click(link), true);
    assert.equal(link.href, "mailto:person@example.com");
    assert.equal(await click(link), false);
    assert.deepEqual(requests, ["/email/1/"]);
    assert.equal(link.textContent, "person@example.com");
});

test("failed requests display an error without changing the link", async () => {
    for (const fetch of [
        () => Promise.resolve({ ok: false }),
        () => Promise.reject(new Error("network error")),
    ]) {
        const link = makeLink("/email/1/");
        renderScripts([link], fetch);
        assert.equal(await click(link), true);
        assert.equal(link.textContent, "Unable to load email");
        assert.equal(link.href, "/email/1/");
        assert.equal(link.listeners.length, 1);
    }
});
