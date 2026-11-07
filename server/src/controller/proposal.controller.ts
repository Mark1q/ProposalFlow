import { NextFunction, Request, Response } from "express";
import { ProposalInput } from "../interfaces/proposal.interface.js";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { proposalGenerationQueue } from "../bullmq/queues/proposal.queue.js";

const createProposal = async (req: Request<{}, {}, ProposalInput>, res: Response, next: NextFunction) => {
    const { scopeId } = req.body
    const userId  = req.user!.id

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
            return next(new AppError("Invalid ID found", 404));
        }

        return next(error);
    } 
}

const getProposalStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const proposal = await prisma.proposal.findUniqueOrThrow({
            where: {
                id: id as string
            }
        });

        return res.status(200).json({ proposalId: proposal.id, status: proposal.status });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return next(new AppError("Proposal not found", 404));
        }

        return next(error);
    }
}

const getProposalData = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const proposal = await prisma.proposal.findUniqueOrThrow({
            where: {
                id: id as string
            },
        })

        return res.status(200).json(proposal);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return next(new AppError("Proposal not found", 404));
        }

        return next(error);
    }
}
export { createProposal, getProposalStatus, getProposalData }