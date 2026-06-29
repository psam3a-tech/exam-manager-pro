import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import departmentsRouter from "./departments";
import coursesRouter from "./courses";
import classesRouter from "./classes";
import questionsRouter from "./questions";
import examsRouter from "./exams";
import enrollmentsRouter from "./enrollments";
import attemptsRouter from "./attempts";
import resultsRouter from "./results";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(departmentsRouter);
router.use(coursesRouter);
router.use(classesRouter);
router.use(questionsRouter);
router.use(examsRouter);
router.use(enrollmentsRouter);
router.use(attemptsRouter);
router.use(resultsRouter);
router.use(analyticsRouter);

export default router;
