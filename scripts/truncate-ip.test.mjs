import { test } from "node:test";
import assert from "node:assert/strict";
import { truncateIp } from "../lib/truncate-ip.mjs";

test("compressed IPv6 keeps its zero groups (issue #32)", () => {
  assert.equal(truncateIp("2001:db8::5"), "2001:db8:0::");
});

test("loopback IPv6", () => {
  assert.equal(truncateIp("::1"), "0:0:0::");
});

test("full uncompressed IPv6", () => {
  assert.equal(truncateIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334"), "2001:db8:85a3::");
});

test("equivalent spellings share a bucket", () => {
  assert.equal(truncateIp("2001:DB8:0:1::"), truncateIp("2001:0db8:0000:0001:0:0:0:9"));
});

test("IPv4 truncates to /24, unchanged behavior", () => {
  assert.equal(truncateIp("203.0.113.42"), "203.0.113.0");
});

test("only the first x-forwarded-for entry counts", () => {
  assert.equal(truncateIp("2001:db8::5, 10.0.0.1"), "2001:db8:0::");
});

test("empty and malformed inputs return null", () => {
  assert.equal(truncateIp(null), null);
  assert.equal(truncateIp(""), null);
  assert.equal(truncateIp("1::2::3"), null);
  assert.equal(truncateIp("not-an-ip"), null);
});
