import express from "express";
import crypto from "crypto";
import chalk from "chalk";
import config from "../config/config.json" with { type: "json" };
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
const port = config.http.port;
const app = express();
const callbackTWUrl = `${config.api["website_url"]}/tvii/getAccessTokenTW`;
const callbackTBUrl = `${config.api["website_url"]}/tvii/getAccessTokenTB`;
const TWConsumerKey = config.api["twttr_consumer_key"];
const TWConsumerSecret = config.api["twttr_consumer_secret"];
const TBConsumerKey = config.api["tumblr_consumer_key"];
const TBConsumerSecret = config.api["tumblr_consumer_secret"];
const oauthAssociations = {};
function generateSixDigitCode() {
    let code;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (code in oauthAssociations);
    return code;
}
function generateNonce() {
    return crypto.randomBytes(16).toString("hex");
}
function generateHmacSha1Signature(baseString, key) {
    const hmac = crypto.createHmac("sha1", key);
    hmac.update(baseString);
    const base64Signature = hmac.digest("base64");
    return encodeURIComponent(base64Signature);
}
app.get("/", (req, res) => {
    res.sendFile("/index.html", { root: "./src/views" });
});
app.get("/tvii/linkSocials", (req, res) => {
    res.sendFile("/tviiLinkSocials.html", { root: "./src/views" });
});
app.get("/tvii/twitterAuth", (req, res) => {
    res.sendFile("/authenticateTwitter.html", { root: "./src/views" });
});
app.get("/tvii/tumblrAuth", (req, res) => {
    res.sendFile("/authenticateTumblr.html", { root: "./src/views" });
});
app.get("/tvii/generateTWCode", async (req, res) => {
    try {
        const generatedCode = generateSixDigitCode();
        const oauthNonce = generateNonce();
        const oauthTimestamp = Math.floor(Date.now() / 1000).toString();
        const params = {
            oauth_callback: `${callbackTWUrl}?code=${generatedCode}`,
            oauth_consumer_key: TWConsumerKey,
            oauth_nonce: oauthNonce,
            oauth_signature_method: "HMAC-SHA1",
            oauth_timestamp: oauthTimestamp,
            oauth_version: "1.0",
        };
        const baseString = `POST&${encodeURIComponent("https://api.twitter.com/oauth/request_token")}&${encodeURIComponent(Object.keys(params)
            .sort()
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join("&"))}`;
        const signingKey = `${encodeURIComponent(TWConsumerSecret)}&`;
        const oauthSignature = generateHmacSha1Signature(baseString, signingKey);
        const authorizationHeader = `OAuth oauth_nonce="${oauthNonce}", oauth_callback="${encodeURIComponent(params.oauth_callback)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${oauthTimestamp}", oauth_consumer_key="${TWConsumerKey}", oauth_signature="${oauthSignature}", oauth_version="1.0"`;
        const response = await fetch("https://api.twitter.com/oauth/request_token", {
            method: "POST",
            headers: {
                "Authorization": authorizationHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const responseBody = await response.text();
        console.log(responseBody);
        const responseParams = new URLSearchParams(responseBody);
        const oauthToken = responseParams.get("oauth_token");
        if (!oauthToken) {
            res.status(400).json({ error: "Failed to obtain request token from Twitter." });
            return;
        }
        const authorizationUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;
        oauthAssociations[generatedCode] = {
            oauthToken,
            type: "TW",
            oauthUrl: authorizationUrl,
            status: "unverified",
        };
        res.status(200).json({
            code: generatedCode,
            type: "TW",
        });
    }
    catch (error) {
        console.error("Error in /twttrLinkAttempt:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
app.get("/tvii/checkForTWRedirect", (req, res) => {
    try {
        const code = req.query.code;
        if (!code ||
            !oauthAssociations[code] ||
            oauthAssociations[code].type !== "TW") {
            return res.sendFile("/invalidAuthCode.html", { root: "./src/views" });
        }
        const authLink = oauthAssociations[code].oauthUrl;
        res.redirect(authLink);
    }
    catch (error) {
        console.error("Error in /twttrCodeCheck:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
app.get("/tvii/getAccessTokenTW", async (req, res) => {
    try {
        const code = req.query.code;
        const oauthToken = req.query.oauth_token;
        const oauthVerifier = req.query.oauth_verifier;
        if (!code || !oauthToken || !oauthVerifier ||
            !oauthAssociations[code] ||
            oauthAssociations[code].oauthToken !== oauthToken ||
            oauthAssociations[code].type !== "TW") {
            res.status(400).json({ error: "Invalid or expired code." });
            return;
        }
        const response = await fetch("https://api.twitter.com/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                oauth_token: oauthToken,
                oauth_verifier: oauthVerifier,
            }),
        });
        const responseBody = await response.text();
        const responseParams = new URLSearchParams(responseBody);
        if (responseParams.has("oauth_token")) {
            const oauthG = oauthAssociations[code];
            oauthG.accessToken = responseParams.get("oauth_token") || "";
            oauthG.accessTokenSecret = responseParams.get("oauth_token_secret") || "";
            oauthG.userId = responseParams.get("user_id") || "";
            oauthG.screenName = responseParams.get("screen_name") || "";
            oauthG.status = "verified";
            return res.sendFile("./src/views/successTwitterAuth.html");
        }
        else {
            return res.sendFile("./src/views/errorTwitterAuth.html");
        }
    }
    catch (error) {
        console.error("Error in /twttrCodeFinalVerification:", error);
        return res.sendFile("./src/views/errors/404.html");
    }
});
app.get("/tvii/clientCheckTWCodeVerified", (req, res) => {
    try {
        const code = req.query.code;
        if (!code || !oauthAssociations[code] || oauthAssociations[code].type !== "TW") {
            res.status(400).json({ error: "Code is not verified or does not exist." });
            return;
        }
        if (oauthAssociations[code].status !== "verified") {
            res.status(200).json({
                code,
                status: "unverified",
                type: oauthAssociations[code].type,
            });
            return;
        }
        const { screenName, accessToken, accessTokenSecret, userId } = oauthAssociations[code];
        res.status(200).json({
            code,
            twttr_screen_name: screenName,
            twttr_oauth_token: accessToken,
            twttr_user_id: userId,
            twttr_oauth_verifier: accessTokenSecret,
            status: "verified",
            type: oauthAssociations[code].type,
        });
        delete oauthAssociations[code];
    }
    catch (error) {
        console.error("Error in /twttrCodeValidYet:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "..", "src", "public")));
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "..", "src", "views", "errors", "404.html"));
});
app.listen(port, () => {
    console.log(chalk.bgGreen(`The Project Rosé website is running on port ${port}`));
});
