export const stageDescriptions = {
    analysis: {
        title: "사용자 요청 분석 설정",
        desc: "사용자 의도를 파악하는 전처리용 LLM 엔진과 키를 선택하세요."
    },
    rag: {
        title: "지식저장소(RAG) 설정",
        desc: "선택한 엔진이 답변 시 참고할 지식 기반(Knowledge Base)를 연결합니다."
    },
    mcp: {
        title: "MCP 기반 도구 연동",
        desc: "기본 제공 기능이나 커스텀 API 엔드 포인트를 연결하여 에이전트의 기능을 확장하세요."
    },
    prompt: {
        title: "에이전트 행동 지침",
        desc: "에이전트가 답변시 지켜야 할 핵심 규칙이나 페르소나를 설정하세요."
    },
    response: {
        title: "디지털 휴먼 응답 LLM 설정",
        desc: "최종 응답을 생성하여 디지털 휴먼에게 전달할 엔진을 선택하세요."
    }
};

export const digitalHumans = [
    { id: "yuri", num: 2 },
    { id: "chanu", num: 1 },
    { id: "sujin", num: 4 }
];