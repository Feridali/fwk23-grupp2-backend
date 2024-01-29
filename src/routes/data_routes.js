const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const refreshTokens = []; // En array för att lagra refresh tokens i minnet

// Middleware-funktion för att hantera refresh tokens
const handleRefreshToken = (req, res, next) => {
  const refreshToken = req.body.refreshToken || req.query.refreshToken;

  // Kolla om refresh token finns
  if (!refreshToken) return res.status(401).send('Refresh token not provided');

  // Kolla om refresh token är giltigt
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).send('Invalid refresh token');
  }

  // Om refresh token är giltigt, hämta användarinformation från tokenen och lägg till det i request-objektet
  try {
    const user = jwt.verify(refreshToken, 'yourRefreshSecretKey');
    req.user = user; // Lägg till användarinformation i request-objektet
    next(); // Gå vidare till nästa middleware eller route-handler
  } catch (error) {
    res.status(403).send('Invalid refresh token');
  }
};

// Använd middleware-funktionen för alla endpoints som kräver en giltig refresh token
router.use(['/token', '/protected-endpoint'], handleRefreshToken);

router.post('/login', (req, res) => {
  // Din autentiseringslogik här...

  // Exempel på ett användarobjekt
  const user = { 
    id: 'yourUserId',
    role: 'admin' // eller 'user'
  };

  // Skapa ett access token och ett refresh token
  const accessToken = jwt.sign(user, 'yourSecretKey', { expiresIn: '15m' });
  const refreshToken = jwt.sign(user, 'yourRefreshSecretKey', { expiresIn: '7d' });

  // Lägg till refresh token i minnet
  refreshTokens.push(refreshToken);

  // Skicka tillbaka access token och refresh token som JSON
  res.json({ accessToken, refreshToken });
});

router.post('/token', (req, res) => {
  // Om vi når hit betyder det att refresh token är giltigt, och användarinformation finns i req.user
  const user = req.user;

  // Skapa ett nytt access token
  const accessToken = jwt.sign(user, 'yourSecretKey', { expiresIn: '15m' });

  // Skicka tillbaka det nya access token som JSON
  res.json({ accessToken });
});

router.get('/protected-endpoint', (req, res) => {
  // Hämta användarinformation från req.user (som satts av middleware-funktionen)
  const user = req.user;

  // Om användaren är admin
  if (user.role === 'admin') {
    res.json({ data: 'secretkey data for admin!' });
  } else {
    res.json({ data: 'secretkey data for user!' });
  }
});

module.exports = router;
