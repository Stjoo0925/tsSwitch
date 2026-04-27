export type TypeScriptRestartStatus = 'ready' | 'restarting' | 'restarted' | 'error' | 'auto';

/**
 * 단일 재시작 이력 항목입니다.
 */
export interface RestartHistoryEntry {
    /** 재시작 시점의 ISO 타임스탬프 */
    timestamp: string;
    /** 결과 상태: 성공 또는 실패 */
    status: 'success' | 'error';
    /** 당시 활성 파일 경로 */
    activeFile: string | undefined;
    /** 당시 활성 언어 ID */
    activeLanguage: string | undefined;
    /** 사용 중인 TS SDK 경로 */
    tsdk: string | undefined;
    /** TS 서버 로그 설정 */
    tsserverLog: string;
    /** 당시 활성 파일의 진단 개수 */
    diagnosticCount: number;
    /** 당시 설정된 TS 서버 최대 메모리(MB) */
    maxTsServerMemory: number | undefined;
}
