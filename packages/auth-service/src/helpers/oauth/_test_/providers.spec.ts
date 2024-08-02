import Providers, { parseProfile } from "../../oauth/providers";
import { describe, test, expect, beforeAll, afterAll } from "bun:test";

describe("Auth Providers", () => {
  test("should correctly parse a Google profile", () => {
    const googleProfile = {
      id: "1234567890",
      email: "test@example.com",
      verified_email: true,
      name: "Test User",
      picture: "https://example.com/picture.jpg",
    };

    const parsedProfile = parseProfile(googleProfile, "Google");

    expect(parsedProfile).toEqual({
      id: "1234567890",
      email: "test@example.com",
      emailVerified: true,
      name: "Test User",
      image: "https://example.com/picture.jpg",
    });
  });

  test("should return undefiend for an unsuported provider", () => {
    const unsupportedProfile = {
      id: "1234456678",
      email: "test@example.com",
    };

    const parsedProfile = parseProfile(unsupportedProfile, "Unsupported");
    expect(parsedProfile).toBeUndefined();
  });
});
