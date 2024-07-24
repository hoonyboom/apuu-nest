import { join } from 'path';

export const PROJECT_ROOT_PATH = process.cwd();
export const PUBLIC_FOLDER_NAME = 'public';
export const POSTS_FOLDER_NAME = 'posts';
export const TEMP_FOLDER_NAME = 'temp';
export const USERS_FOLDER_NAME = 'users';

// 업로드에 쓰일 위치: 프로젝트위치/public/posts
export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);
export const POSTS_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, POSTS_FOLDER_NAME);
export const USERS_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, USERS_FOLDER_NAME);
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, TEMP_FOLDER_NAME);

// 렌더링에 쓰일 위치: 상대경로 public/posts/xxx.jpg
export const POST_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  POSTS_FOLDER_NAME,
);
export const USER_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  USERS_FOLDER_NAME,
);
