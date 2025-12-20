import { NextFunction, Request, Response } from "express";
import { ProposalId, ProposalInput } from "../interfaces/proposal.interface";
import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";
import { proposalGenerationQueue } from "../bullmq/queues/proposal.queue";

const createProposal = async (req: Request<{}, {}, ProposalInput>, res: Response, next: NextFunction) => {
    const { scopeId, userId } = req.body;

    try {
        const proposal = await prisma.proposal.create({
            data: {
                scopeId: scopeId,
                userId: userId
            }
        });

        await proposalGenerationQueue.add('processProposalJob', {
            proposalId: proposal.id
        });

        return res.status(200).json({ proposalId: proposal.id, status: proposal.status});
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P2003") {
            return next(new AppError("Invalid ID found", 500));
        }

        return next(new AppError(error instanceof Error ? error.message : "Internal server error", 500));
    } 
}

const getProposalStatus = async (req: Request<ProposalId>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const proposal = await prisma.proposal.findUniqueOrThrow({
            where: {
                id: id
            }
        });

        return res.status(200).json({ proposalId: proposal.id, status: proposal.status });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return next(new AppError("Proposal not found", 404));
        }

        const msg = error instanceof Error ? error.message : "Unexpected error";
        return next(new AppError(msg, 500));
    }
}

const getProposalData = async (req: Request<ProposalId>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const proposal = await prisma.proposal.findUniqueOrThrow({
            where: {
                id: id
            },
        })

        return res.status(200).json(proposal);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return next(new AppError("Proposal not found", 404));
        }

        const msg = error instanceof Error ? error.message : "Unexpected error";
        return next(new AppError(msg, 500));
    }
}
export { createProposal, getProposalStatus, getProposalData }