/// <reference types="node" />

import { FastifyPluginAsync } from "fastify";
import fetch from "node-fetch";
require("dotenv").config({ path: __dirname + "/../.env" });

const FORTYTWO_CLIENT_ID = process.env.FORTYTWO_CLIENT_ID || "";
const FORTYTWO_CLIENT_SECRET = process.env.FORTYTWO_CLIENT_SECRET || "";
const FORTYTWO_REDIRECT_URI =
  process.env.FORTYTWO_REDIRECT_URI ||
  "https://localhost:8443/api/auth/42/callback";

const fortyTwoAuthPlugin: FastifyPluginAsync = async (fastify) => {
  // Redirect to 42 OAuth
  fastify.get("/api/auth/42", async (request, reply) => {
    const authUrl = new URL("https://api.intra.42.fr/oauth/authorize");
    authUrl.searchParams.append("client_id", FORTYTWO_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", FORTYTWO_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "public");
    authUrl.searchParams.append(
      "state",
      Math.random().toString(36).substring(7)
    );

    return reply.redirect(authUrl.toString());
  });

  // Callback after 42 login
  fastify.get("/api/auth/42/callback", async (request, reply) => {
    const { code, state } = request.query as { code?: string; state?: string };

    if (!code) {
      return reply.status(400).send({ error: "No code provided" });
    }

    try {
      // 1. Exchange code for access token
      const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${FORTYTWO_CLIENT_ID}:${FORTYTWO_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: FORTYTWO_REDIRECT_URI,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        throw new Error(
          `Failed to get access token: ${tokenResponse.status} - ${errorBody}`
        );
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 2. Get user info
      const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        const errorBody = await userResponse.text();
        throw new Error(
          `Failed to get user info: ${userResponse.status} - ${errorBody}`
        );
      }

      const userData = await userResponse.json();
      const { id, email, login, image } = userData;

      if (!email) {
        return reply.status(400).send({ error: "Email is required" });
      }

      // 3. Upsert user in your DB - SIMPLE IMPLEMENTATION (NO TRANSACTIONS)
      let user: any;
      try {
        const userRes = await fetch(
          "http://user_management:9001/api/user/upsert-42",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              fortyTwoId: String(id),
              username: login,
              picture: image?.link,
            }),
          }
        );

        if (!userRes.ok) {
          const errorBody = await userRes.text();
          throw new Error(
            `User service failed: ${userRes.status} - ${errorBody}`
          );
        }

        user = await userRes.json();
      } catch (err: any) {
        fastify.log.error("Failed to upsert user:", err);
        return reply.status(500).send({ error: "User creation failed" });
      }

      // 4. Generate JWT
      const authToken = await fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: "7d" }
      );

      // 5. Set cookie - CRITICAL FIX FOR COOKIE HANDLING
      reply.setCookie("authToken", authToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none", // Required for cross-origin requests
        path: "/",
        domain: "localhost", // Works for local development
      });

      // 6. Redirect to frontend
      return reply.redirect("https://localhost:3000/#home");
    } catch (err: any) {
      fastify.log.error("42 auth error:", err);
      return reply.status(500).send({
        error: "Authentication failed",
        detail: err.message,
      });
    }
  });
};

export default fortyTwoAuthPlugin;

/* import { FastifyPluginAsync } from "fastify";
import fetch from "node-fetch";
require("dotenv").config({ path: __dirname + "/../.env" });

const FORTYTWO_CLIENT_ID = process.env.FORTYTWO_CLIENT_ID || "";
const FORTYTWO_CLIENT_SECRET = process.env.FORTYTWO_CLIENT_SECRET || "";
const FORTYTWO_REDIRECT_URI =
  process.env.FORTYTWO_REDIRECT_URI ||
  "https://localhost:8443/api/auth/42/callback";

const fortyTwoAuthPlugin: FastifyPluginAsync = async (fastify) => {
  // Redirect to 42 OAuth
  fastify.get("/api/auth/42", async (request, reply) => {
    const authUrl = new URL("https://api.intra.42.fr/oauth/authorize");
    authUrl.searchParams.append("client_id", FORTYTWO_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", FORTYTWO_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "public");
    authUrl.searchParams.append(
      "state",
      Math.random().toString(36).substring(7)
    ); // Add state parameter

    return reply.redirect(authUrl.toString());
  });

  // Callback after 42 login
  fastify.get("/api/auth/42/callback", async (request, reply) => {
    const { code, state } = request.query as { code?: string; state?: string };

    if (!code) {
      return reply.status(400).send({ error: "No code provided" });
    }

    try {
      // 1. Exchange code for access token
      const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${FORTYTWO_CLIENT_ID}:${FORTYTWO_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: FORTYTWO_REDIRECT_URI,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        throw new Error(
          `Failed to get access token: ${tokenResponse.status} - ${errorBody}`
        );
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 2. Get user info
      const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        const errorBody = await userResponse.text();
        throw new Error(
          `Failed to get user info: ${userResponse.status} - ${errorBody}`
        );
      }

      const userData = await userResponse.json();
      const { id, email, login, image } = userData;

      if (!email) {
        return reply.status(400).send({ error: "Email is required" });
      }

      // 3. Upsert user in your DB
      let user: any;
      try {
        const userRes = await fetch(
          "http://user_management:9001/api/user/upsert-42",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              fortyTwoId: String(id),
              username: login,
              picture: image?.link,
            }),
          }
        );

        if (!userRes.ok) {
          const errorBody = await userRes.text();
          throw new Error(
            `User service failed: ${userRes.status} - ${errorBody}`
          );
        }

        user = await userRes.json();
      } catch (err: any) {
        fastify.log.error("Failed to upsert user:", err);
        return reply.status(500).send({ error: "User creation failed" });
      }

      // 4. Generate JWT
      const authToken = await fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: "7d" }
      );

      // 5. Set cookie - CRITICAL FIX FOR LOCAL DEVELOPMENT
      reply.setCookie("authToken", authToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        domain: "localhost", // This works for local development
      });

      // 6. Redirect to frontend
      return reply.redirect("https://localhost:3000/#home");
    } catch (err: any) {
      fastify.log.error("42 auth error:", err);
      return reply.status(500).send({
        error: "Authentication failed",
        detail: err.message,
      });
    }
  });
};

export default fortyTwoAuthPlugin; */


/* import { FastifyPluginAsync } from "fastify";
import fetch from "node-fetch";
require("dotenv").config({ path: __dirname + "/../.env" });

const FORTYTWO_CLIENT_ID = process.env.FORTYTWO_CLIENT_ID || "";
const FORTYTWO_CLIENT_SECRET = process.env.FORTYTWO_CLIENT_SECRET || "";
const FORTYTWO_REDIRECT_URI =
  process.env.FORTYTWO_REDIRECT_URI ||
  "https://localhost:8443/api/auth/42/callback";

const fortyTwoAuthPlugin: FastifyPluginAsync = async (fastify) => {
  // Redirect to 42 OAuth
  fastify.get("/api/auth/42", async (request, reply) => {
    const authUrl = new URL("https://api.intra.42.fr/oauth/authorize");
    authUrl.searchParams.append("client_id", FORTYTWO_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", FORTYTWO_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "public");

    return reply.redirect(authUrl.toString());
  });

  // Callback after 42 login
  fastify.get("/api/auth/42/callback", async (request, reply) => {
    const { code } = request.query as { code?: string };

    if (!code) {
      return reply.status(400).send({ error: "No code provided" });
    }

    try {
      // 1. Exchange code for access token
      const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${FORTYTWO_CLIENT_ID}:${FORTYTWO_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
        //   client_id: FORTYTWO_CLIENT_ID,
          code,
          redirect_uri: FORTYTWO_REDIRECT_URI,
        }).toString(),
      });

      fastify.log.info(`42 token response status: ${tokenResponse.status}`);

      // Get response body (handle both JSON and plain text errors)
      let tokenResponseBody;
      try {
        tokenResponseBody = await tokenResponse.json();
      } catch (e) {
        tokenResponseBody = await tokenResponse.text();
      }

      fastify.log.info(
        `42 token response body: ${JSON.stringify(tokenResponseBody)}`
      );

      if (!tokenResponse.ok) {
        throw new Error(
          `Failed to get access token: ${
            tokenResponse.status
          } - ${JSON.stringify(tokenResponseBody)}`
        );
      }

      const tokenData = tokenResponseBody;
      const accessToken = tokenData.access_token;

      // 2. Get user info
      const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      fastify.log.info(`42 user response status: ${userResponse.status}`);

      // Get user response body
      let userResponseBody;
      try {
        userResponseBody = await userResponse.json();
      } catch (e) {
        userResponseBody = await userResponse.text();
      }

      fastify.log.info(
        `42 user response body: ${JSON.stringify(userResponseBody)}`
      );

      if (!userResponse.ok) {
        throw new Error(
          `Failed to get user info: ${userResponse.status} - ${JSON.stringify(
            userResponseBody
          )}`
        );
      }

      const userData = userResponseBody;
      const { id, email, login, image } = userData;

      if (!email) {
        return reply.status(400).send({ error: "Email is required" });
      }

      // 3. Upsert user in your DB
      let user: any;
      try {
        const userRes = await fetch(
          "http://user_management:9001/api/user/upsert-42",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              fortyTwoId: String(id),
              username: login,
              picture: image?.link,
            }),
          }
        );

        fastify.log.info(`User service response status: ${userRes.status}`);

        let userResBody;
        try {
          userResBody = await userRes.json();
        } catch (e) {
          userResBody = await userRes.text();
        }

        fastify.log.info(
          `User service response body: ${JSON.stringify(userResBody)}`
        );

        if (!userRes.ok) {
          throw new Error(
            `User service failed: ${userRes.status} - ${JSON.stringify(
              userResBody
            )}`
          );
        }

        user = userResBody;
      } catch (err: any) {
        fastify.log.error("Failed to upsert user:", err);
        return reply.status(500).send({ error: "User creation failed" });
      }

      // 4. Generate JWT
      const authToken = await fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: "7d" }
      );

      // 5. Set cookie
      reply.setCookie("authToken", authToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        domain: "localhost",
        maxAge: 60 * 60 * 24 * 7,
      });

      // 6. Redirect to frontend (use relative path)
      return reply.redirect("https://localhost:3000/#home");
    } catch (err: any) {
      fastify.log.error("42 auth error:", err);
      return reply.status(500).send({
        error: "Authentication failed",
        detail: err.message,
      });
    }
  });
};

export default fortyTwoAuthPlugin; */

/* /// <reference types="node" />
import { FastifyPluginAsync } from "fastify";
require("dotenv").config({ path: __dirname + "/../.env" });

const FORTYTWO_CLIENT_ID = process.env.FORTYTWO_CLIENT_ID || "";
const FORTYTWO_CLIENT_SECRET = process.env.FORTYTWO_CLIENT_SECRET || "";
const FORTYTWO_REDIRECT_URI =
  process.env.FORTYTWO_REDIRECT_URI ||
  "https://localhost:8443/api/auth/42/callback";

const fortyTwoAuthPlugin: FastifyPluginAsync = async (fastify) => {
  // Redirect to 42 OAuth
  fastify.get("/api/auth/42", async (request, reply) => {
    const authUrl = new URL("https://api.intra.42.fr/oauth/authorize");
    authUrl.searchParams.append("client_id", FORTYTWO_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", FORTYTWO_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "public");

    return reply.redirect(authUrl.toString());
  });

  // Callback after 42 login
  fastify.get("/api/auth/42/callback", async (request, reply) => {
    const { code } = request.query as { code?: string };

    if (!code) {
      return reply.status(400).send({ error: "No code provided" });
    }

    try {
      // 1. Exchange code for access token
      const tokenResponse = await fastify.inject({
        method: "POST",
        url: "https://api.intra.42.fr/oauth/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-internal-request": "true", // Add this header
          Authorization: `Basic ${Buffer.from(
            `${FORTYTWO_CLIENT_ID}:${FORTYTWO_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        payload: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: FORTYTWO_CLIENT_ID,
          code,
          redirect_uri: FORTYTWO_REDIRECT_URI,
        }).toString(),
      });

      fastify.log.info(`42 token response status: ${tokenResponse.statusCode}`);
      fastify.log.info(`42 token response payload: ${tokenResponse.payload}`);

      if (tokenResponse.statusCode !== 200) {
        throw new Error(
          `Failed to get access token: ${tokenResponse.statusCode} - ${tokenResponse.payload}`
        );
      }

      const tokenData = tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 2. Get user info
      const userResponse = await fastify.inject({
        method: "GET",
        url: "https://api.intra.42.fr/v2/me",
        headers: {
          "x-internal-request": "true", // Add this header
          Authorization: `Bearer ${accessToken}`,
        },
      });

      fastify.log.info(`42 user response status: ${userResponse.statusCode}`);
      fastify.log.info(`42 user response payload: ${userResponse.payload}`);

      if (userResponse.statusCode !== 200) {
        throw new Error(
          `Failed to get user info: ${userResponse.statusCode} - ${userResponse.payload}`
        );
      }

      const userData = userResponse.json();
      const { id, email, login, image } = userData;

      if (!email) {
        return reply.status(400).send({ error: "Email is required" });
      }

      // 3. Upsert user in your DB
      let user: any;
      try {
        const userRes = await fastify.inject({
          method: "POST",
          url: "http://user_management:9001/api/user/upsert-42",
          headers: {
            "x-internal-request": "true", // Add this header
          },
          payload: {
            email,
            fortyTwoId: id,
            username: login,
            picture: image?.link,
          },
        });
        fastify.log.info(`User service response: ${userRes.payload}`);

        if (userRes.statusCode !== 200) {
          throw new Error(
            `User service failed: ${userRes.statusCode} - ${userRes.payload}`
          );
        }

        user = userRes.json();
      } catch (err: any) {
        fastify.log.error("Failed to upsert user:", err);
        return reply.status(500).send({ error: "User creation failed" });
      }

      // 4. Generate JWT
      const authToken = await fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: "7d" }
      );

      // 5. Set cookie
      reply.setCookie("authToken", authToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      // 6. Redirect to frontend (use relative path)
      return reply.redirect("/#play");
    } catch (err: any) {
      fastify.log.error("42 auth error:", err);
      return reply.status(500).send({
        error: "Authentication failed",
        detail: err.message,
      });
    }
  });
};

export default fortyTwoAuthPlugin;
 */
