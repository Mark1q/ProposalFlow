import { NextFunction, Request, Response } from "express";
import { ScopeId, ScopeInput } from "../interfaces/scope.interface";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { Prisma } from "../generated/prisma/client";

const createScope = async (req: Request<{}, {}, ScopeInput>, res: Response, next: NextFunction) => {
    const scopeJson = req.body;

    if (!scopeJson) { return next(new AppError("Empty JSON Object provided", 401)); }
    if (!req.user) { return next(new AppError("Authentication required", 401)); }
    
    try {
        const scope = await prisma.scope.create({
            data : {
                scopeJson: JSON.parse(JSON.stringify(scopeJson)),
                user: {
                    connect: { id: req.user.id }
                },
            }
        });

        return res.status(200).json({ scope_id: scope.id });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return next(new AppError(`UserId not found`, 404));
        }
        
        return next(new AppError(error instanceof Error ? error.message : "Internal server error", 500));
    }
}

const getScopeById = async (req: Request<ScopeId>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const scope = await prisma.scope.findUniqueOrThrow({
            where: {
                id: id
            }
        })

        return res.status(200).json({ id: scope.id, scopeJson: scope.scopeJson, createdAt: scope.createdAt });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return next(new AppError("Scope not found", 404));
            }
        }

        const msg = error instanceof Error ? error.message : "Unexpected error";
        return next(new AppError(msg, 500));
    }
}

export { createScope, getScopeById }