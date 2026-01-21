import { Request, Response } from "express";

export default class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Bad request" });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });

        }

    }
}

