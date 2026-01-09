// DTO pour les sessions actives
export class SessionDto {
  constructor(session, isCurrent = false) {
    this.id = session.id;
    this.userAgent = session.userAgent || "Unknown";
    this.ipAddress = session.ipAddress || "Unknown";
    this.createdAt = session.createdAt;
    this.expiresAt = session.expiresAt;
    this.isCurrent = isCurrent;
  }

  static transform(sessions, currentToken) {
    return sessions.map((session) => 
      new SessionDto(session, session.token === currentToken)
    );
  }
}