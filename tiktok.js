const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const XMLHttpRequest = require('xhr2');

app.use(cookieParser());
app.use(cors());
app.use(express.static('./pabluc'))

const CLIENT_KEY    = 'awgdk9501hfb0aiy'; // القيمة يمكن العثور عليها في بوابة مطوري التطبيق
const CLIENT_SECRET = 'AjUcksBh0fv0QAkCp3yZhNIgeuKhblGV'; // ضع هنا سر العميل الخاص بك
const REDIRECT_URI  = 'https://isldzl.onrender.com/home'; // تأكد من استخدام HTTPS

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
});

app.get('/oauth', (req, res) => {
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie('csrfState', csrfState, { maxAge: 60000 });

    let url = 'https://www.tiktok.com/v2/auth/authorize/';
    url += '?state=' + csrfState;
    url += `&client_key=${CLIENT_KEY}`;
    url += '&scope=user.info.basic';
    url += '&response_type=code';
    url += `&redirect_uri=${REDIRECT_URI}`;

    res.redirect(url);
});

app.get('/home', (req, res) => {
    const { code, state } = req.query;
    const csrfState = req.cookies.csrfState;
    console.log('callback')
    if (state !== csrfState) {
        return res.status(403).send('Invalid state parameter');
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://open-api.tiktok.com/oauth/access_token/');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const tokenResponse = JSON.parse(xhr.responseText);
            const accessToken = tokenResponse.data.access_token;
                console.log(`{${accessToken}}`)
            const userXhr = new XMLHttpRequest();
            userXhr.open('GET', 'https://open-api.tiktok.com/oauth/userinfo/');
            userXhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

            userXhr.onreadystatechange = function () {
                if (userXhr.readyState === 4 && userXhr.status === 200) {
                    const userInfo = JSON.parse(userXhr.responseText).data;
                    res.send(`معلومات المستخدم الأساسية: ${JSON.stringify(userInfo)}\n    ${accessToken}`);
                } else if (userXhr.readyState === 4) {
                    console.error('Error getting user info:', userXhr.responseText);
                    res.status(500).send('Error getting user info');
                }
            };

            userXhr.send();
        } else if (xhr.readyState === 4) {
            console.error('Error getting access token:', xhr.responseText);
            res.status(500).send('Error getting access token');
        }
    };

    const params = new URLSearchParams();
    params.append('client_key', CLIENT_KEY);
    params.append('client_secret', CLIENT_SECRET);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', REDIRECT_URI);

    xhr.send(params.toString());
});