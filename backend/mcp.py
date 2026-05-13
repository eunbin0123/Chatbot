import httpx
import json
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from auth import get_current_user
from database import User

router = APIRouter(prefix="/mcp", tags=["MCP"])

SMITHERY_API_KEY = os.getenv("SMITHERY_API_KEY", "")


# =========================================================
# 스키마
# =========================================================

class MCPToolCallRequest(BaseModel):
    server_url: Optional[str] = ""
    tool_name: str
    arguments: dict = {}
    config: Optional[dict] = {}

class MCPListToolsRequest(BaseModel):
    server_url: Optional[str] = ""
    config: Optional[dict] = {}
    qualifiedName: Optional[str] = None
    apiKey: Optional[str] = ""

class ToolboxCallRequest(BaseModel):
    tool_name: str
    qualified_name: Optional[str] = None
    arguments: dict = {}


# =========================================================
# 유틸: Smithery MCP 서버 JSON-RPC 호출
# =========================================================

def toolbox_url():
    return f"https://server.smithery.ai/@smithery/toolbox/mcp?api_key={SMITHERY_API_KEY}"


async def call_mcp_jsonrpc(url: str, method: str, params: dict) -> Any:
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
    }
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"MCP 오류: {response.text}"
            )

        content_type = response.headers.get("content-type", "")
        if "text/event-stream" in content_type:
            result = None
            for line in response.text.splitlines():
                if line.startswith("data:"):
                    data_str = line[5:].strip()
                    if data_str and data_str != "[DONE]":
                        try:
                            data = json.loads(data_str)
                            if "result" in data:
                                result = data["result"]
                        except json.JSONDecodeError:
                            pass
            return result
        else:
            data = response.json()
            if "error" in data:
                raise HTTPException(status_code=400, detail=str(data["error"]))
            return data.get("result")


# =========================================================
# Toolbox 엔드포인트 (auth 불필요)
# =========================================================

POPULAR_SMITHERY_TOOLS = [
    {"name": "weather", "display_name": "날씨 정보", "description": "실시간 날씨 조회 (API 키 불필요)", "qualifiedName": "@ismailbl72/weather-forecast-mcp",
     "inputSchema": {"properties": {"city": {"type": "string", "description": "도시 이름 (비우면 현재 위치 자동 감지)"}}}},
    {"name": "puppeteer", "display_name": "웹 브라우저 자동화", "description": "웹페이지 자동화 및 스크래핑", "qualifiedName": "@modelcontextprotocol/server-puppeteer",
     "inputSchema": {"properties": {"url": {"type": "string", "description": "자동화할 웹 페이지 URL"}}, "required": ["url"]}},
    {"name": "filesystem", "display_name": "파일 시스템", "description": "로컬 파일 읽기/쓰기", "qualifiedName": "@modelcontextprotocol/server-filesystem",
     "inputSchema": {"properties": {
       "action": {"type": "string", "description": "작업 종류: 'read'(읽기) 또는 'write'(쓰기)"},
       "path": {"type": "string", "description": "파일 경로 (예: C:/Users/user/Desktop/test.txt)"},
       "content": {"type": "string", "description": "쓸 내용 (write일 때만 필요)"}
     }, "required": ["action", "path"]}},
]


@router.get("/toolbox/tools")
async def toolbox_list_tools():
    """Smithery 인기 툴 목록 (하드코딩)"""
    tools = [
        {
            "name": t["name"],
            "display_name": t["display_name"],
            "description": t["description"],
            "qualifiedName": t["qualifiedName"],
            "inputSchema": t.get("inputSchema", {"properties": {}, "type": "object"}),
        }
        for t in POPULAR_SMITHERY_TOOLS
    ]
    return {"tools": tools}


BRIDGE_URL = os.getenv("BRIDGE_URL", "http://localhost:3100")


@router.post("/toolbox/call")
async def toolbox_call_tool(req: ToolboxCallRequest):
    """Smithery 툴 호출 (브릿지 서버 경유)"""
    try:
        # qualified_name 우선, 없으면 tool_name으로 매칭
        if req.qualified_name:
            qualified_name = req.qualified_name
            tool_name = req.tool_name
        else:
            matched = next((t for t in POPULAR_SMITHERY_TOOLS if t["name"] == req.tool_name), None)
            qualified_name = matched["qualifiedName"] if matched else req.tool_name
            tool_name = req.tool_name

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                f"{BRIDGE_URL}/call",
                json={
                    "qualifiedName": qualified_name,
                    "toolName": tool_name,
                    "arguments": req.arguments,
                }
            )
            if not res.is_success:
                raise HTTPException(status_code=res.status_code, detail=res.text)
            return {"result": res.json().get("result")}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# 일반 MCP 엔드포인트 (auth 필요)
# =========================================================

@router.get("/search")
async def search_smithery(
    q: str,
    pageSize: int = 10,
    current_user: User = Depends(get_current_user)
):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                "https://registry.smithery.ai/servers",
                params={"q": q, "pageSize": pageSize},
                headers={"Authorization": f"Bearer {SMITHERY_API_KEY}"}
            )
            return {"servers": res.json().get("servers", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tools")
async def list_tools(
    req: MCPListToolsRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        server_url = req.server_url
        if not server_url and req.qualifiedName:
            api_key_param = f"?api_key={SMITHERY_API_KEY}" if SMITHERY_API_KEY else ""
            server_url = f"https://server.smithery.ai/{req.qualifiedName}/mcp{api_key_param}"
        result = await call_mcp_jsonrpc(server_url, "tools/list", {})
        return {"tools": result.get("tools", []) if result else []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/call")
async def call_tool(
    req: MCPToolCallRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        result = await call_mcp_jsonrpc(
            req.server_url, "tools/call",
            {"name": req.tool_name, "arguments": req.arguments}
        )
        return {"result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def mcp_health():
    return {"api_key_set": bool(SMITHERY_API_KEY)}
