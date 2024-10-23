import { Request, Response, NextFunction } from 'express';

const STATIC_TOKEN = '70k3n5up3rS3gur0';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers['authorization'];
    if (!bearerToken) {
        return res.status(403).json({ message: 'Request Not Authorized :(): Missing Authorization Header' });
    }
    const token = bearerToken.split(' ')[1];

    if (token !== STATIC_TOKEN ) {
        return res.status(403).json({ message: 'Request Not Authorized :(' });
    }

    next();
};
