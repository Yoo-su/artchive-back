# 📚 ArtChive - Backend API

**ArtChive** 프로젝트의 NestJS 기반 백엔드 API 서버입니다. 이 서버는 프론트엔드 애플리케이션에 필요한 모든 데이터와 비즈니스 로직을 제공하며, 안정적이고 확장 가능한 백엔드 시스템을 목표로 설계되었습니다.

---

## ✨ 주요 기능 및 API 엔드포인트

- **인증 (Authentication)**: `Passport.js`와 `JWT`를 사용한 안전한 인증 시스템
- **유저 (Users)**: 소셜 로그인 기반의 사용자 관리
- **도서 및 판매글 (Books & Posts)**: 중고 서적 판매글에 대한 CRUD 기능
- **실시간 채팅 (Chat)**: `Socket.IO`를 이용한 1:1 실시간 채팅 기능

### API Endpoint Details

| Feature        | Endpoint                       |  Method  | Auth | Description                                      |
| -------------- | ------------------------------ | :------: | :--: | ------------------------------------------------ |
| **Auth**       | `/auth/social-login`           |  `POST`  |  ❌  | 카카오/네이버 소셜 로그인 및 JWT 발급            |
|                | `/auth/refresh`                |  `POST`  |  ✅  | Refresh Token을 사용해 새로운 Access Token 발급  |
| **User**       | `/user/me`                     |  `GET`   |  ✅  | 현재 로그인된 사용자 프로필 조회                 |
|                | `/user/my-posts`               |  `GET`   |  ✅  | 내가 작성한 모든 판매글 목록 조회                |
| **Book**       | `/book/sell`                   |  `POST`  |  ✅  | 중고 서적 판매글 생성                            |
|                | `/book/posts/recent`           |  `GET`   |  ❌  | 최신 판매글 10개 조회 (메인페이지용)             |
|                | `/book/posts/:id`              |  `GET`   |  ❌  | 특정 판매글 상세 정보 조회                       |
|                | `/book/posts/:id`              | `PATCH`  |  ✅  | 특정 판매글 정보 수정                            |
|                | `/book/posts/:id`              | `DELETE` |  ✅  | 특정 판매글 삭제                                 |
|                | `/book/posts/:id/status`       | `PATCH`  |  ✅  | 판매글 상태 변경 (판매중, 예약중, 판매완료)      |
|                | `/book/:isbn/posts`            |  `GET`   |  ❌  | 특정 ISBN의 모든 판매글 목록 조회 (페이지네이션) |
| **Chat**       | `/chat/rooms`                  |  `POST`  |  ✅  | 특정 판매글에 대한 채팅방 생성 또는 조회         |
|                | `/chat/rooms`                  |  `GET`   |  ✅  | 내 모든 채팅방 목록 조회                         |
|                | `/chat/rooms/:roomId`          | `DELETE` |  ✅  | 특정 채팅방 나가기                               |
|                | `/chat/rooms/:roomId/messages` |  `GET`   |  ✅  | 특정 채팅방 메시지 목록 조회 (페이지네이션)      |
|                | `/chat/rooms/:roomId/read`     | `PATCH`  |  ✅  | 채팅방 메시지 모두 읽음 처리                     |
| **WebSockets** | `(event: sendMessage)`         |    -     |  ✅  | 메시지 전송 및 저장                              |
|                | `(event: joinRoom)`            |    -     |  ✅  | 채팅방 입장                                      |
|                | `(event: userLeft)`            |    -     |  ✅  | 상대방에게 채팅방 나감 알림                      |

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분               | 기술                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Framework**      | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)                                                    |
| **Language**       | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)                                        |
| **Database**       | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)                                        |
| **ORM**            | **TypeORM** - PostgreSQL 데이터베이스와의 상호작용을 위한 객체-관계 매핑(ORM) 라이브러리                                             |
| **Authentication** | ![Passport](https://img.shields.io/badge/Passport-34E27A?logo=passport&logoColor=white) **(JWT Strategy)** - 토큰 기반 인증 구현     |
| **Real-time**      | ![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socketdotio&logoColor=white) - WebSocket을 이용한 실시간 양방향 통신 |
| **Validation**     | **class-validator**, **class-transformer** - DTO를 통한 요청 데이터 유효성 검사 및 변환                                              |
| **Configuration**  | **@nestjs/config** - `.env` 파일을 사용한 환경 변수 관리                                                                             |

---

## 💡 아키텍처 및 주요 기술 결정

### 1. 모듈 기반 아키텍처 (Modular Architecture)

- 프로젝트를 `Auth`, `User`, `Book`, `Chat` 등 기능별 모듈로 분리하여 **높은 응집도**와 **낮은 결합도**를 유지했습니다.
- 각 모듈은 `Controller`, `Service`, `Entity`, `DTO` 등으로 구성되어 역할과 책임이 명확하며, 이는 프로젝트의 유지보수성과 확장성을 크게 향상시킵니다.

### 2. TypeORM을 이용한 데이터베이스 관리

- TypeScript 데코레이터를 사용하여 엔티티(Entity)를 직관적으로 정의하고, 데이터베이스 스키마와 애플리케이션 모델을 일관되게 관리합니다.
- `Repository Pattern`을 활용하여 데이터베이스 로직을 서비스 레이어로부터 분리하고, 테스트 용이성을 확보했습니다.
- 엔티티 간의 관계(`@ManyToOne`, `@OneToMany` 등)와 `CASCADE`, `onDelete` 옵션을 설정하여 데이터 무결성을 보장합니다.

### 3. JWT 기반의 인증 흐름

1.  **소셜 로그인**: 프론트엔드에서 `NextAuth.js`를 통해 소셜 로그인을 완료하면, 백엔드의 `socialLogin` 서비스가 호출됩니다.
2.  **유저 식별 및 생성**: `UserService`를 통해 기존 유저를 찾거나, 새로운 유저인 경우 DB에 생성합니다.
3.  **토큰 발급**: 유저 식별 후, `AuthService`는 해당 유저의 고유 ID(`sub`)를 담은 **Access Token**과 **Refresh Token**을 생성하여 프론트엔드에 반환합니다.
4.  **API 보호**: `AuthGuard('jwt')`를 사용하여 보호된 엔드포인트에 접근 시 `Authorization` 헤더의 Access Token을 검증합니다.
5.  **토큰 재발급**: Access Token이 만료되면, 프론트엔드는 Refresh Token을 사용하여 새로운 Access Token을 발급받아 인증 상태를 유지합니다.

### 4. WebSocket을 이용한 실시간 채팅

- `@nestjs/websockets` 모듈과 `Socket.IO`를 사용하여 실시간 채팅 기능을 구현했습니다.
- **`ChatGateway`**: 클라이언트의 WebSocket 연결, 이벤트 수신(`@SubscribeMessage`), 이벤트 송출(`server.emit`) 등 모든 실시간 통신을 담당합니다.
- **`ChatService`**: 메시지 저장, 채팅방 상태 변경 등 채팅 관련 비즈니스 로직을 처리합니다.
- **순환 종속성 해결**: `ChatService`는 실시간 이벤트 전송을 위해 `ChatGateway`를 필요로 하고, `ChatGateway`는 비즈니스 로직 처리를 위해 `ChatService`를 필요로 합니다. 이 순환 종속성 문제는 양쪽 모두에서 `forwardRef`를 사용하여 해결했습니다.

---

## 🏁 시작하기 (Getting Started)

1.  **Repository 클론:**

    ```bash
    git clone [Repository URL]
    cd [프로젝트 폴더명]
    ```

2.  **의존성 설치:**

    ```bash
    npm install
    ```

3.  **데이터베이스 설정:**
    - 로컬 환경에 PostgreSQL을 설치하고 실행합니다.
    - `.env` 파일에 `DATABASE_URL`을 설정합니다. (예: `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"`)

4.  **개발 서버 실행:**
    ```bash
    npm run start:dev
    ```
