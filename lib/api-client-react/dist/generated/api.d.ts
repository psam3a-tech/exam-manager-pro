import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AnalyticsOverview, AnswerInput, Attempt, AttemptDetail, AttemptInput, AuthResponse, Class, ClassInput, ClassUpdate, Course, CourseInput, CourseUpdate, Department, DepartmentInput, DepartmentUpdate, Enrollment, EnrollmentInput, Exam, ExamAnalytics, ExamDetail, ExamInput, ExamQuestionInput, ExamUpdate, GradeInput, HealthStatus, LecturerAnalytics, ListAttemptsParams, ListClassesParams, ListCoursesParams, ListEnrollmentsParams, ListExamsParams, ListQuestionsParams, ListResultsParams, ListUsersParams, LoginInput, Question, QuestionInput, QuestionUpdate, Result, ResultDetail, StudentAnalytics, User, UserInput, UserUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLoginUrl: () => string;
/**
 * @summary Login
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Login
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout
 */
export declare const logout: (options?: RequestInit) => Promise<void>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListUsersUrl: (params?: ListUsersParams) => string;
/**
 * @summary List all users
 */
export declare const listUsers: (params?: ListUsersParams, options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: (params?: ListUsersParams) => readonly ["/api/users", ...ListUsersParams[]];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateUserUrl: () => string;
/**
 * @summary Create a user
 */
export declare const createUser: (userInput: UserInput, options?: RequestInit) => Promise<User>;
export declare const getCreateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
export type CreateUserMutationResult = NonNullable<Awaited<ReturnType<typeof createUser>>>;
export type CreateUserMutationBody = BodyType<UserInput>;
export type CreateUserMutationError = ErrorType<unknown>;
/**
* @summary Create a user
*/
export declare const useCreateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
export declare const getGetUserUrl: (id: number) => string;
/**
 * @summary Get user by ID
 */
export declare const getUser: (id: number, options?: RequestInit) => Promise<User>;
export declare const getGetUserQueryKey: (id: number) => readonly [`/api/users/${number}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<unknown>;
/**
 * @summary Get user by ID
 */
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserUrl: (id: number) => string;
/**
 * @summary Update user
 */
export declare const updateUser: (id: number, userUpdate: UserUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UserUpdate>;
export type UpdateUserMutationError = ErrorType<unknown>;
/**
* @summary Update user
*/
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export declare const getDeleteUserUrl: (id: number) => string;
/**
 * @summary Delete user
 */
export declare const deleteUser: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export type DeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUser>>>;
export type DeleteUserMutationError = ErrorType<unknown>;
/**
* @summary Delete user
*/
export declare const useDeleteUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export declare const getListDepartmentsUrl: () => string;
/**
 * @summary List departments
 */
export declare const listDepartments: (options?: RequestInit) => Promise<Department[]>;
export declare const getListDepartmentsQueryKey: () => readonly ["/api/departments"];
export declare const getListDepartmentsQueryOptions: <TData = Awaited<ReturnType<typeof listDepartments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDepartments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDepartments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDepartmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listDepartments>>>;
export type ListDepartmentsQueryError = ErrorType<unknown>;
/**
 * @summary List departments
 */
export declare function useListDepartments<TData = Awaited<ReturnType<typeof listDepartments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDepartments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateDepartmentUrl: () => string;
/**
 * @summary Create department
 */
export declare const createDepartment: (departmentInput: DepartmentInput, options?: RequestInit) => Promise<Department>;
export declare const getCreateDepartmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDepartment>>, TError, {
        data: BodyType<DepartmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDepartment>>, TError, {
    data: BodyType<DepartmentInput>;
}, TContext>;
export type CreateDepartmentMutationResult = NonNullable<Awaited<ReturnType<typeof createDepartment>>>;
export type CreateDepartmentMutationBody = BodyType<DepartmentInput>;
export type CreateDepartmentMutationError = ErrorType<unknown>;
/**
* @summary Create department
*/
export declare const useCreateDepartment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDepartment>>, TError, {
        data: BodyType<DepartmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDepartment>>, TError, {
    data: BodyType<DepartmentInput>;
}, TContext>;
export declare const getUpdateDepartmentUrl: (id: number) => string;
/**
 * @summary Update department
 */
export declare const updateDepartment: (id: number, departmentUpdate: DepartmentUpdate, options?: RequestInit) => Promise<Department>;
export declare const getUpdateDepartmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDepartment>>, TError, {
        id: number;
        data: BodyType<DepartmentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDepartment>>, TError, {
    id: number;
    data: BodyType<DepartmentUpdate>;
}, TContext>;
export type UpdateDepartmentMutationResult = NonNullable<Awaited<ReturnType<typeof updateDepartment>>>;
export type UpdateDepartmentMutationBody = BodyType<DepartmentUpdate>;
export type UpdateDepartmentMutationError = ErrorType<unknown>;
/**
* @summary Update department
*/
export declare const useUpdateDepartment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDepartment>>, TError, {
        id: number;
        data: BodyType<DepartmentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDepartment>>, TError, {
    id: number;
    data: BodyType<DepartmentUpdate>;
}, TContext>;
export declare const getDeleteDepartmentUrl: (id: number) => string;
/**
 * @summary Delete department
 */
export declare const deleteDepartment: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteDepartmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDepartment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDepartment>>, TError, {
    id: number;
}, TContext>;
export type DeleteDepartmentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDepartment>>>;
export type DeleteDepartmentMutationError = ErrorType<unknown>;
/**
* @summary Delete department
*/
export declare const useDeleteDepartment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDepartment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDepartment>>, TError, {
    id: number;
}, TContext>;
export declare const getListCoursesUrl: (params?: ListCoursesParams) => string;
/**
 * @summary List courses
 */
export declare const listCourses: (params?: ListCoursesParams, options?: RequestInit) => Promise<Course[]>;
export declare const getListCoursesQueryKey: (params?: ListCoursesParams) => readonly ["/api/courses", ...ListCoursesParams[]];
export declare const getListCoursesQueryOptions: <TData = Awaited<ReturnType<typeof listCourses>>, TError = ErrorType<unknown>>(params?: ListCoursesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCourses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCourses>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCoursesQueryResult = NonNullable<Awaited<ReturnType<typeof listCourses>>>;
export type ListCoursesQueryError = ErrorType<unknown>;
/**
 * @summary List courses
 */
export declare function useListCourses<TData = Awaited<ReturnType<typeof listCourses>>, TError = ErrorType<unknown>>(params?: ListCoursesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCourses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCourseUrl: () => string;
/**
 * @summary Create course
 */
export declare const createCourse: (courseInput: CourseInput, options?: RequestInit) => Promise<Course>;
export declare const getCreateCourseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCourse>>, TError, {
        data: BodyType<CourseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCourse>>, TError, {
    data: BodyType<CourseInput>;
}, TContext>;
export type CreateCourseMutationResult = NonNullable<Awaited<ReturnType<typeof createCourse>>>;
export type CreateCourseMutationBody = BodyType<CourseInput>;
export type CreateCourseMutationError = ErrorType<unknown>;
/**
* @summary Create course
*/
export declare const useCreateCourse: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCourse>>, TError, {
        data: BodyType<CourseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCourse>>, TError, {
    data: BodyType<CourseInput>;
}, TContext>;
export declare const getGetCourseUrl: (id: number) => string;
/**
 * @summary Get course by ID
 */
export declare const getCourse: (id: number, options?: RequestInit) => Promise<Course>;
export declare const getGetCourseQueryKey: (id: number) => readonly [`/api/courses/${number}`];
export declare const getGetCourseQueryOptions: <TData = Awaited<ReturnType<typeof getCourse>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCourse>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCourse>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCourseQueryResult = NonNullable<Awaited<ReturnType<typeof getCourse>>>;
export type GetCourseQueryError = ErrorType<unknown>;
/**
 * @summary Get course by ID
 */
export declare function useGetCourse<TData = Awaited<ReturnType<typeof getCourse>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCourse>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCourseUrl: (id: number) => string;
/**
 * @summary Update course
 */
export declare const updateCourse: (id: number, courseUpdate: CourseUpdate, options?: RequestInit) => Promise<Course>;
export declare const getUpdateCourseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCourse>>, TError, {
        id: number;
        data: BodyType<CourseUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCourse>>, TError, {
    id: number;
    data: BodyType<CourseUpdate>;
}, TContext>;
export type UpdateCourseMutationResult = NonNullable<Awaited<ReturnType<typeof updateCourse>>>;
export type UpdateCourseMutationBody = BodyType<CourseUpdate>;
export type UpdateCourseMutationError = ErrorType<unknown>;
/**
* @summary Update course
*/
export declare const useUpdateCourse: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCourse>>, TError, {
        id: number;
        data: BodyType<CourseUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCourse>>, TError, {
    id: number;
    data: BodyType<CourseUpdate>;
}, TContext>;
export declare const getDeleteCourseUrl: (id: number) => string;
/**
 * @summary Delete course
 */
export declare const deleteCourse: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCourseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCourse>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCourse>>, TError, {
    id: number;
}, TContext>;
export type DeleteCourseMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCourse>>>;
export type DeleteCourseMutationError = ErrorType<unknown>;
/**
* @summary Delete course
*/
export declare const useDeleteCourse: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCourse>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCourse>>, TError, {
    id: number;
}, TContext>;
export declare const getListClassesUrl: (params?: ListClassesParams) => string;
/**
 * @summary List classes
 */
export declare const listClasses: (params?: ListClassesParams, options?: RequestInit) => Promise<Class[]>;
export declare const getListClassesQueryKey: (params?: ListClassesParams) => readonly ["/api/classes", ...ListClassesParams[]];
export declare const getListClassesQueryOptions: <TData = Awaited<ReturnType<typeof listClasses>>, TError = ErrorType<unknown>>(params?: ListClassesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listClasses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listClasses>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListClassesQueryResult = NonNullable<Awaited<ReturnType<typeof listClasses>>>;
export type ListClassesQueryError = ErrorType<unknown>;
/**
 * @summary List classes
 */
export declare function useListClasses<TData = Awaited<ReturnType<typeof listClasses>>, TError = ErrorType<unknown>>(params?: ListClassesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listClasses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateClassUrl: () => string;
/**
 * @summary Create class
 */
export declare const createClass: (classInput: ClassInput, options?: RequestInit) => Promise<Class>;
export declare const getCreateClassMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClass>>, TError, {
        data: BodyType<ClassInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createClass>>, TError, {
    data: BodyType<ClassInput>;
}, TContext>;
export type CreateClassMutationResult = NonNullable<Awaited<ReturnType<typeof createClass>>>;
export type CreateClassMutationBody = BodyType<ClassInput>;
export type CreateClassMutationError = ErrorType<unknown>;
/**
* @summary Create class
*/
export declare const useCreateClass: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClass>>, TError, {
        data: BodyType<ClassInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createClass>>, TError, {
    data: BodyType<ClassInput>;
}, TContext>;
export declare const getUpdateClassUrl: (id: number) => string;
/**
 * @summary Update class
 */
export declare const updateClass: (id: number, classUpdate: ClassUpdate, options?: RequestInit) => Promise<Class>;
export declare const getUpdateClassMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateClass>>, TError, {
        id: number;
        data: BodyType<ClassUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateClass>>, TError, {
    id: number;
    data: BodyType<ClassUpdate>;
}, TContext>;
export type UpdateClassMutationResult = NonNullable<Awaited<ReturnType<typeof updateClass>>>;
export type UpdateClassMutationBody = BodyType<ClassUpdate>;
export type UpdateClassMutationError = ErrorType<unknown>;
/**
* @summary Update class
*/
export declare const useUpdateClass: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateClass>>, TError, {
        id: number;
        data: BodyType<ClassUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateClass>>, TError, {
    id: number;
    data: BodyType<ClassUpdate>;
}, TContext>;
export declare const getDeleteClassUrl: (id: number) => string;
/**
 * @summary Delete class
 */
export declare const deleteClass: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteClassMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteClass>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteClass>>, TError, {
    id: number;
}, TContext>;
export type DeleteClassMutationResult = NonNullable<Awaited<ReturnType<typeof deleteClass>>>;
export type DeleteClassMutationError = ErrorType<unknown>;
/**
* @summary Delete class
*/
export declare const useDeleteClass: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteClass>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteClass>>, TError, {
    id: number;
}, TContext>;
export declare const getListQuestionsUrl: (params?: ListQuestionsParams) => string;
/**
 * @summary List questions
 */
export declare const listQuestions: (params?: ListQuestionsParams, options?: RequestInit) => Promise<Question[]>;
export declare const getListQuestionsQueryKey: (params?: ListQuestionsParams) => readonly ["/api/questions", ...ListQuestionsParams[]];
export declare const getListQuestionsQueryOptions: <TData = Awaited<ReturnType<typeof listQuestions>>, TError = ErrorType<unknown>>(params?: ListQuestionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listQuestions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListQuestionsQueryResult = NonNullable<Awaited<ReturnType<typeof listQuestions>>>;
export type ListQuestionsQueryError = ErrorType<unknown>;
/**
 * @summary List questions
 */
export declare function useListQuestions<TData = Awaited<ReturnType<typeof listQuestions>>, TError = ErrorType<unknown>>(params?: ListQuestionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateQuestionUrl: () => string;
/**
 * @summary Create question
 */
export declare const createQuestion: (questionInput: QuestionInput, options?: RequestInit) => Promise<Question>;
export declare const getCreateQuestionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuestion>>, TError, {
        data: BodyType<QuestionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createQuestion>>, TError, {
    data: BodyType<QuestionInput>;
}, TContext>;
export type CreateQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof createQuestion>>>;
export type CreateQuestionMutationBody = BodyType<QuestionInput>;
export type CreateQuestionMutationError = ErrorType<unknown>;
/**
* @summary Create question
*/
export declare const useCreateQuestion: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuestion>>, TError, {
        data: BodyType<QuestionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createQuestion>>, TError, {
    data: BodyType<QuestionInput>;
}, TContext>;
export declare const getGetQuestionUrl: (id: number) => string;
/**
 * @summary Get question
 */
export declare const getQuestion: (id: number, options?: RequestInit) => Promise<Question>;
export declare const getGetQuestionQueryKey: (id: number) => readonly [`/api/questions/${number}`];
export declare const getGetQuestionQueryOptions: <TData = Awaited<ReturnType<typeof getQuestion>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuestion>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getQuestion>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetQuestionQueryResult = NonNullable<Awaited<ReturnType<typeof getQuestion>>>;
export type GetQuestionQueryError = ErrorType<unknown>;
/**
 * @summary Get question
 */
export declare function useGetQuestion<TData = Awaited<ReturnType<typeof getQuestion>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuestion>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateQuestionUrl: (id: number) => string;
/**
 * @summary Update question
 */
export declare const updateQuestion: (id: number, questionUpdate: QuestionUpdate, options?: RequestInit) => Promise<Question>;
export declare const getUpdateQuestionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuestion>>, TError, {
        id: number;
        data: BodyType<QuestionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateQuestion>>, TError, {
    id: number;
    data: BodyType<QuestionUpdate>;
}, TContext>;
export type UpdateQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof updateQuestion>>>;
export type UpdateQuestionMutationBody = BodyType<QuestionUpdate>;
export type UpdateQuestionMutationError = ErrorType<unknown>;
/**
* @summary Update question
*/
export declare const useUpdateQuestion: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuestion>>, TError, {
        id: number;
        data: BodyType<QuestionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateQuestion>>, TError, {
    id: number;
    data: BodyType<QuestionUpdate>;
}, TContext>;
export declare const getDeleteQuestionUrl: (id: number) => string;
/**
 * @summary Delete question
 */
export declare const deleteQuestion: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteQuestionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
    id: number;
}, TContext>;
export type DeleteQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteQuestion>>>;
export type DeleteQuestionMutationError = ErrorType<unknown>;
/**
* @summary Delete question
*/
export declare const useDeleteQuestion: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
    id: number;
}, TContext>;
export declare const getListExamsUrl: (params?: ListExamsParams) => string;
/**
 * @summary List exams
 */
export declare const listExams: (params?: ListExamsParams, options?: RequestInit) => Promise<Exam[]>;
export declare const getListExamsQueryKey: (params?: ListExamsParams) => readonly ["/api/exams", ...ListExamsParams[]];
export declare const getListExamsQueryOptions: <TData = Awaited<ReturnType<typeof listExams>>, TError = ErrorType<unknown>>(params?: ListExamsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listExams>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listExams>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListExamsQueryResult = NonNullable<Awaited<ReturnType<typeof listExams>>>;
export type ListExamsQueryError = ErrorType<unknown>;
/**
 * @summary List exams
 */
export declare function useListExams<TData = Awaited<ReturnType<typeof listExams>>, TError = ErrorType<unknown>>(params?: ListExamsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listExams>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateExamUrl: () => string;
/**
 * @summary Create exam
 */
export declare const createExam: (examInput: ExamInput, options?: RequestInit) => Promise<Exam>;
export declare const getCreateExamMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createExam>>, TError, {
        data: BodyType<ExamInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createExam>>, TError, {
    data: BodyType<ExamInput>;
}, TContext>;
export type CreateExamMutationResult = NonNullable<Awaited<ReturnType<typeof createExam>>>;
export type CreateExamMutationBody = BodyType<ExamInput>;
export type CreateExamMutationError = ErrorType<unknown>;
/**
* @summary Create exam
*/
export declare const useCreateExam: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createExam>>, TError, {
        data: BodyType<ExamInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createExam>>, TError, {
    data: BodyType<ExamInput>;
}, TContext>;
export declare const getGetExamUrl: (id: number) => string;
/**
 * @summary Get exam
 */
export declare const getExam: (id: number, options?: RequestInit) => Promise<ExamDetail>;
export declare const getGetExamQueryKey: (id: number) => readonly [`/api/exams/${number}`];
export declare const getGetExamQueryOptions: <TData = Awaited<ReturnType<typeof getExam>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getExam>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getExam>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetExamQueryResult = NonNullable<Awaited<ReturnType<typeof getExam>>>;
export type GetExamQueryError = ErrorType<unknown>;
/**
 * @summary Get exam
 */
export declare function useGetExam<TData = Awaited<ReturnType<typeof getExam>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getExam>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateExamUrl: (id: number) => string;
/**
 * @summary Update exam
 */
export declare const updateExam: (id: number, examUpdate: ExamUpdate, options?: RequestInit) => Promise<Exam>;
export declare const getUpdateExamMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateExam>>, TError, {
        id: number;
        data: BodyType<ExamUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateExam>>, TError, {
    id: number;
    data: BodyType<ExamUpdate>;
}, TContext>;
export type UpdateExamMutationResult = NonNullable<Awaited<ReturnType<typeof updateExam>>>;
export type UpdateExamMutationBody = BodyType<ExamUpdate>;
export type UpdateExamMutationError = ErrorType<unknown>;
/**
* @summary Update exam
*/
export declare const useUpdateExam: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateExam>>, TError, {
        id: number;
        data: BodyType<ExamUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateExam>>, TError, {
    id: number;
    data: BodyType<ExamUpdate>;
}, TContext>;
export declare const getDeleteExamUrl: (id: number) => string;
/**
 * @summary Delete exam
 */
export declare const deleteExam: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteExamMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteExam>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteExam>>, TError, {
    id: number;
}, TContext>;
export type DeleteExamMutationResult = NonNullable<Awaited<ReturnType<typeof deleteExam>>>;
export type DeleteExamMutationError = ErrorType<unknown>;
/**
* @summary Delete exam
*/
export declare const useDeleteExam: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteExam>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteExam>>, TError, {
    id: number;
}, TContext>;
export declare const getAddExamQuestionUrl: (id: number) => string;
/**
 * @summary Add question to exam
 */
export declare const addExamQuestion: (id: number, examQuestionInput: ExamQuestionInput, options?: RequestInit) => Promise<void>;
export declare const getAddExamQuestionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addExamQuestion>>, TError, {
        id: number;
        data: BodyType<ExamQuestionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addExamQuestion>>, TError, {
    id: number;
    data: BodyType<ExamQuestionInput>;
}, TContext>;
export type AddExamQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof addExamQuestion>>>;
export type AddExamQuestionMutationBody = BodyType<ExamQuestionInput>;
export type AddExamQuestionMutationError = ErrorType<unknown>;
/**
* @summary Add question to exam
*/
export declare const useAddExamQuestion: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addExamQuestion>>, TError, {
        id: number;
        data: BodyType<ExamQuestionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addExamQuestion>>, TError, {
    id: number;
    data: BodyType<ExamQuestionInput>;
}, TContext>;
export declare const getRemoveExamQuestionUrl: (id: number, questionId: number) => string;
/**
 * @summary Remove question from exam
 */
export declare const removeExamQuestion: (id: number, questionId: number, options?: RequestInit) => Promise<void>;
export declare const getRemoveExamQuestionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeExamQuestion>>, TError, {
        id: number;
        questionId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof removeExamQuestion>>, TError, {
    id: number;
    questionId: number;
}, TContext>;
export type RemoveExamQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof removeExamQuestion>>>;
export type RemoveExamQuestionMutationError = ErrorType<unknown>;
/**
* @summary Remove question from exam
*/
export declare const useRemoveExamQuestion: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeExamQuestion>>, TError, {
        id: number;
        questionId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof removeExamQuestion>>, TError, {
    id: number;
    questionId: number;
}, TContext>;
export declare const getPublishExamUrl: (id: number) => string;
/**
 * @summary Publish exam
 */
export declare const publishExam: (id: number, options?: RequestInit) => Promise<Exam>;
export declare const getPublishExamMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof publishExam>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof publishExam>>, TError, {
    id: number;
}, TContext>;
export type PublishExamMutationResult = NonNullable<Awaited<ReturnType<typeof publishExam>>>;
export type PublishExamMutationError = ErrorType<unknown>;
/**
* @summary Publish exam
*/
export declare const usePublishExam: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof publishExam>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof publishExam>>, TError, {
    id: number;
}, TContext>;
export declare const getListEnrollmentsUrl: (params?: ListEnrollmentsParams) => string;
/**
 * @summary List enrollments
 */
export declare const listEnrollments: (params?: ListEnrollmentsParams, options?: RequestInit) => Promise<Enrollment[]>;
export declare const getListEnrollmentsQueryKey: (params?: ListEnrollmentsParams) => readonly ["/api/enrollments", ...ListEnrollmentsParams[]];
export declare const getListEnrollmentsQueryOptions: <TData = Awaited<ReturnType<typeof listEnrollments>>, TError = ErrorType<unknown>>(params?: ListEnrollmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEnrollments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listEnrollments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListEnrollmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listEnrollments>>>;
export type ListEnrollmentsQueryError = ErrorType<unknown>;
/**
 * @summary List enrollments
 */
export declare function useListEnrollments<TData = Awaited<ReturnType<typeof listEnrollments>>, TError = ErrorType<unknown>>(params?: ListEnrollmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEnrollments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateEnrollmentUrl: () => string;
/**
 * @summary Enroll student in course
 */
export declare const createEnrollment: (enrollmentInput: EnrollmentInput, options?: RequestInit) => Promise<Enrollment>;
export declare const getCreateEnrollmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEnrollment>>, TError, {
        data: BodyType<EnrollmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEnrollment>>, TError, {
    data: BodyType<EnrollmentInput>;
}, TContext>;
export type CreateEnrollmentMutationResult = NonNullable<Awaited<ReturnType<typeof createEnrollment>>>;
export type CreateEnrollmentMutationBody = BodyType<EnrollmentInput>;
export type CreateEnrollmentMutationError = ErrorType<unknown>;
/**
* @summary Enroll student in course
*/
export declare const useCreateEnrollment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEnrollment>>, TError, {
        data: BodyType<EnrollmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEnrollment>>, TError, {
    data: BodyType<EnrollmentInput>;
}, TContext>;
export declare const getDeleteEnrollmentUrl: (id: number) => string;
/**
 * @summary Remove enrollment
 */
export declare const deleteEnrollment: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteEnrollmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEnrollment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEnrollment>>, TError, {
    id: number;
}, TContext>;
export type DeleteEnrollmentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEnrollment>>>;
export type DeleteEnrollmentMutationError = ErrorType<unknown>;
/**
* @summary Remove enrollment
*/
export declare const useDeleteEnrollment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEnrollment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEnrollment>>, TError, {
    id: number;
}, TContext>;
export declare const getListAttemptsUrl: (params?: ListAttemptsParams) => string;
/**
 * @summary List exam attempts
 */
export declare const listAttempts: (params?: ListAttemptsParams, options?: RequestInit) => Promise<Attempt[]>;
export declare const getListAttemptsQueryKey: (params?: ListAttemptsParams) => readonly ["/api/attempts", ...ListAttemptsParams[]];
export declare const getListAttemptsQueryOptions: <TData = Awaited<ReturnType<typeof listAttempts>>, TError = ErrorType<unknown>>(params?: ListAttemptsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAttempts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAttempts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAttemptsQueryResult = NonNullable<Awaited<ReturnType<typeof listAttempts>>>;
export type ListAttemptsQueryError = ErrorType<unknown>;
/**
 * @summary List exam attempts
 */
export declare function useListAttempts<TData = Awaited<ReturnType<typeof listAttempts>>, TError = ErrorType<unknown>>(params?: ListAttemptsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAttempts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getStartAttemptUrl: () => string;
/**
 * @summary Start exam attempt
 */
export declare const startAttempt: (attemptInput: AttemptInput, options?: RequestInit) => Promise<AttemptDetail>;
export declare const getStartAttemptMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startAttempt>>, TError, {
        data: BodyType<AttemptInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof startAttempt>>, TError, {
    data: BodyType<AttemptInput>;
}, TContext>;
export type StartAttemptMutationResult = NonNullable<Awaited<ReturnType<typeof startAttempt>>>;
export type StartAttemptMutationBody = BodyType<AttemptInput>;
export type StartAttemptMutationError = ErrorType<unknown>;
/**
* @summary Start exam attempt
*/
export declare const useStartAttempt: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startAttempt>>, TError, {
        data: BodyType<AttemptInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof startAttempt>>, TError, {
    data: BodyType<AttemptInput>;
}, TContext>;
export declare const getGetAttemptUrl: (id: number) => string;
/**
 * @summary Get attempt with questions
 */
export declare const getAttempt: (id: number, options?: RequestInit) => Promise<AttemptDetail>;
export declare const getGetAttemptQueryKey: (id: number) => readonly [`/api/attempts/${number}`];
export declare const getGetAttemptQueryOptions: <TData = Awaited<ReturnType<typeof getAttempt>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAttempt>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAttempt>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAttemptQueryResult = NonNullable<Awaited<ReturnType<typeof getAttempt>>>;
export type GetAttemptQueryError = ErrorType<unknown>;
/**
 * @summary Get attempt with questions
 */
export declare function useGetAttempt<TData = Awaited<ReturnType<typeof getAttempt>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAttempt>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSubmitAnswerUrl: (id: number) => string;
/**
 * @summary Submit answer for a question
 */
export declare const submitAnswer: (id: number, answerInput: AnswerInput, options?: RequestInit) => Promise<void>;
export declare const getSubmitAnswerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitAnswer>>, TError, {
        id: number;
        data: BodyType<AnswerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitAnswer>>, TError, {
    id: number;
    data: BodyType<AnswerInput>;
}, TContext>;
export type SubmitAnswerMutationResult = NonNullable<Awaited<ReturnType<typeof submitAnswer>>>;
export type SubmitAnswerMutationBody = BodyType<AnswerInput>;
export type SubmitAnswerMutationError = ErrorType<unknown>;
/**
* @summary Submit answer for a question
*/
export declare const useSubmitAnswer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitAnswer>>, TError, {
        id: number;
        data: BodyType<AnswerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitAnswer>>, TError, {
    id: number;
    data: BodyType<AnswerInput>;
}, TContext>;
export declare const getSubmitAttemptUrl: (id: number) => string;
/**
 * @summary Submit exam (finish attempt)
 */
export declare const submitAttempt: (id: number, options?: RequestInit) => Promise<Result>;
export declare const getSubmitAttemptMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitAttempt>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitAttempt>>, TError, {
    id: number;
}, TContext>;
export type SubmitAttemptMutationResult = NonNullable<Awaited<ReturnType<typeof submitAttempt>>>;
export type SubmitAttemptMutationError = ErrorType<unknown>;
/**
* @summary Submit exam (finish attempt)
*/
export declare const useSubmitAttempt: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitAttempt>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitAttempt>>, TError, {
    id: number;
}, TContext>;
export declare const getListResultsUrl: (params?: ListResultsParams) => string;
/**
 * @summary List results
 */
export declare const listResults: (params?: ListResultsParams, options?: RequestInit) => Promise<Result[]>;
export declare const getListResultsQueryKey: (params?: ListResultsParams) => readonly ["/api/results", ...ListResultsParams[]];
export declare const getListResultsQueryOptions: <TData = Awaited<ReturnType<typeof listResults>>, TError = ErrorType<unknown>>(params?: ListResultsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listResults>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listResults>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListResultsQueryResult = NonNullable<Awaited<ReturnType<typeof listResults>>>;
export type ListResultsQueryError = ErrorType<unknown>;
/**
 * @summary List results
 */
export declare function useListResults<TData = Awaited<ReturnType<typeof listResults>>, TError = ErrorType<unknown>>(params?: ListResultsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listResults>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetResultUrl: (id: number) => string;
/**
 * @summary Get detailed result
 */
export declare const getResult: (id: number, options?: RequestInit) => Promise<ResultDetail>;
export declare const getGetResultQueryKey: (id: number) => readonly [`/api/results/${number}`];
export declare const getGetResultQueryOptions: <TData = Awaited<ReturnType<typeof getResult>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getResult>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getResult>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetResultQueryResult = NonNullable<Awaited<ReturnType<typeof getResult>>>;
export type GetResultQueryError = ErrorType<unknown>;
/**
 * @summary Get detailed result
 */
export declare function useGetResult<TData = Awaited<ReturnType<typeof getResult>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getResult>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGradeResultUrl: (id: number) => string;
/**
 * @summary Grade essay/manual questions
 */
export declare const gradeResult: (id: number, gradeInput: GradeInput, options?: RequestInit) => Promise<Result>;
export declare const getGradeResultMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof gradeResult>>, TError, {
        id: number;
        data: BodyType<GradeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof gradeResult>>, TError, {
    id: number;
    data: BodyType<GradeInput>;
}, TContext>;
export type GradeResultMutationResult = NonNullable<Awaited<ReturnType<typeof gradeResult>>>;
export type GradeResultMutationBody = BodyType<GradeInput>;
export type GradeResultMutationError = ErrorType<unknown>;
/**
* @summary Grade essay/manual questions
*/
export declare const useGradeResult: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof gradeResult>>, TError, {
        id: number;
        data: BodyType<GradeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof gradeResult>>, TError, {
    id: number;
    data: BodyType<GradeInput>;
}, TContext>;
export declare const getGetAnalyticsOverviewUrl: () => string;
/**
 * @summary Platform-wide overview stats
 */
export declare const getAnalyticsOverview: (options?: RequestInit) => Promise<AnalyticsOverview>;
export declare const getGetAnalyticsOverviewQueryKey: () => readonly ["/api/analytics/overview"];
export declare const getGetAnalyticsOverviewQueryOptions: <TData = Awaited<ReturnType<typeof getAnalyticsOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalyticsOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAnalyticsOverview>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAnalyticsOverviewQueryResult = NonNullable<Awaited<ReturnType<typeof getAnalyticsOverview>>>;
export type GetAnalyticsOverviewQueryError = ErrorType<unknown>;
/**
 * @summary Platform-wide overview stats
 */
export declare function useGetAnalyticsOverview<TData = Awaited<ReturnType<typeof getAnalyticsOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalyticsOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetExamAnalyticsUrl: (examId: number) => string;
/**
 * @summary Exam-level analytics
 */
export declare const getExamAnalytics: (examId: number, options?: RequestInit) => Promise<ExamAnalytics>;
export declare const getGetExamAnalyticsQueryKey: (examId: number) => readonly [`/api/analytics/exams/${number}`];
export declare const getGetExamAnalyticsQueryOptions: <TData = Awaited<ReturnType<typeof getExamAnalytics>>, TError = ErrorType<unknown>>(examId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getExamAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getExamAnalytics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetExamAnalyticsQueryResult = NonNullable<Awaited<ReturnType<typeof getExamAnalytics>>>;
export type GetExamAnalyticsQueryError = ErrorType<unknown>;
/**
 * @summary Exam-level analytics
 */
export declare function useGetExamAnalytics<TData = Awaited<ReturnType<typeof getExamAnalytics>>, TError = ErrorType<unknown>>(examId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getExamAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetStudentAnalyticsUrl: (studentId: number) => string;
/**
 * @summary Student performance analytics
 */
export declare const getStudentAnalytics: (studentId: number, options?: RequestInit) => Promise<StudentAnalytics>;
export declare const getGetStudentAnalyticsQueryKey: (studentId: number) => readonly [`/api/analytics/students/${number}`];
export declare const getGetStudentAnalyticsQueryOptions: <TData = Awaited<ReturnType<typeof getStudentAnalytics>>, TError = ErrorType<unknown>>(studentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStudentAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStudentAnalytics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStudentAnalyticsQueryResult = NonNullable<Awaited<ReturnType<typeof getStudentAnalytics>>>;
export type GetStudentAnalyticsQueryError = ErrorType<unknown>;
/**
 * @summary Student performance analytics
 */
export declare function useGetStudentAnalytics<TData = Awaited<ReturnType<typeof getStudentAnalytics>>, TError = ErrorType<unknown>>(studentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStudentAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetLecturerAnalyticsUrl: (lecturerId: number) => string;
/**
 * @summary Lecturer dashboard analytics
 */
export declare const getLecturerAnalytics: (lecturerId: number, options?: RequestInit) => Promise<LecturerAnalytics>;
export declare const getGetLecturerAnalyticsQueryKey: (lecturerId: number) => readonly [`/api/analytics/lecturer/${number}`];
export declare const getGetLecturerAnalyticsQueryOptions: <TData = Awaited<ReturnType<typeof getLecturerAnalytics>>, TError = ErrorType<unknown>>(lecturerId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLecturerAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLecturerAnalytics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLecturerAnalyticsQueryResult = NonNullable<Awaited<ReturnType<typeof getLecturerAnalytics>>>;
export type GetLecturerAnalyticsQueryError = ErrorType<unknown>;
/**
 * @summary Lecturer dashboard analytics
 */
export declare function useGetLecturerAnalytics<TData = Awaited<ReturnType<typeof getLecturerAnalytics>>, TError = ErrorType<unknown>>(lecturerId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLecturerAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map