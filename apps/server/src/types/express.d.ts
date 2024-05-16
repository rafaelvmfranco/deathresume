import { ResumeDto, UserDto } from "@reactive-resume/dto";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      payload?: {
        resume: Resume;
      };
    }
  }
}

export {};
