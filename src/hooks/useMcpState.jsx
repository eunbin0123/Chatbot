import { useState } from "react";
import {
  searchSmitheryServers,
  fetchSmitheryTools,
  parseSmitheryToolSpec,
} from "../utils/adminUtils";
import { syncMcpToStorage } from "../utils/adminUtils";

export function useMcpState() {
  // ── 디렉토리 / 아이템 ──
  const [mcpDirectories, setMcpDirectories] = useState([]);
  const [mcpList, setMcpList] = useState([]);
  const [isInitialMcpLoaded, setIsInitialMcpLoaded] = useState(false);

  // ── 디렉토리 추가 모달 ──
  const [isAddDirModalOpen, setIsAddDirModalOpen] = useState(false);
  const [newDirName, setNewDirName] = useState("");
  const [newDirDesc, setNewDirDesc] = useState("");

  // ── Smithery 아이템 모달 ──
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [targetDirId, setTargetDirId] = useState(null);
  const [targetItemId, setTargetItemId] = useState(null);

  // ── Smithery 검색/선택 ──
  const [smitherySearchQuery, setSmitherySearchQuery] = useState("");
  const [smitherySearchResults, setSmitherySearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [smitheryToolName, setSmitheryToolName] = useState("");
  const [smitheryToolSpec, setSmitheryToolSpec] = useState(null);
  const [isFetchingSpec, setIsFetchingSpec] = useState(false);
  const [smitheryFetchError, setSmitheryFetchError] = useState("");
  const [selectedSmitheryServer, setSelectedSmitheryServer] = useState(null);
  const [serverToolList, setServerToolList] = useState([]);
  const [selectedToolName, setSelectedToolName] = useState("");
  const [smitheryApiKey, setSmitheryApiKey] = useState("");
  const [smitheryNeedsApiKey, setSmitheryNeedsApiKey] = useState(false);

  // ── MCP 중앙 데이터 관리 ──
  const updateMcpData = (newDirs) => {
    setMcpDirectories(newDirs);
    localStorage.setItem("klever_mcp_directories", JSON.stringify(newDirs));
    const flat = [];
    newDirs.forEach((dir) => {
      dir.items.forEach((item) => {
        flat.push({
          id: item.id,
          name: item.name,
          desc: item.type === "smithery" ? item.name : item.url,
          type: item.type || "smithery",
          method: item.method || "POST",
          active: item.active,
          apiKey: item.apiKey || "",
          parameters: item.params || [],
          qualifiedName: item.qualifiedName || "",
        });
      });
    });
    setMcpList(flat);
    syncMcpToStorage(flat, setMcpList);
  };

  // ── 디렉토리 조작 ──
  const toggleDirectory = (id) =>
    updateMcpData(mcpDirectories.map((dir) => dir.id === id ? { ...dir, isOpen: !dir.isOpen } : dir));

  const toggleDirectoryActive = (id, e) => {
    e.stopPropagation();
    updateMcpData(mcpDirectories.map((dir) => {
      if (dir.id !== id) return dir;
      return { ...dir, active: dir.items.length === 0 ? false : !dir.active };
    }));
  };

  const handleDeleteDirectory = (id, e) => {
    e.stopPropagation();
    updateMcpData(mcpDirectories.filter((dir) => dir.id !== id));
  };

  const handleAddDirectory = () => {
    const dirName = newDirName.trim() || "새 디렉토리";
    updateMcpData([
      ...mcpDirectories,
      { id: `dir_${Date.now()}`, name: dirName, description: newDirDesc.trim(), active: false, isOpen: true, items: [] },
    ]);
    setIsAddDirModalOpen(false);
    setNewDirName("");
    setNewDirDesc("");
  };

  // ── 아이템 조작 ──
  const toggleItemActive = (dirId, itemId, e) => {
    e.stopPropagation();
    updateMcpData(mcpDirectories.map((dir) =>
      dir.id === dirId
        ? { ...dir, items: dir.items.map((item) => item.id === itemId ? { ...item, active: !item.active } : item) }
        : dir
    ));
  };

  const handleDeleteApiItem = (dirId, itemId) => {
    updateMcpData(mcpDirectories.map((dir) => {
      if (dir.id !== dirId) return dir;
      const newItems = dir.items.filter((item) => item.id !== itemId);
      return { ...dir, items: newItems, active: newItems.length === 0 ? false : dir.active };
    }));
  };

  // ── Smithery 모달 열기/닫기 ──
  const openSmitheryModal = ({ dirId, item = null }) => {
    setTargetDirId(dirId);
    setTargetItemId(item ? item.id : null);
    if (item) {
      setSmitheryToolName(item.name);
      setSmitheryToolSpec({ description: item.description || "", parameters: item.params || [] });
      setSmitheryApiKey(item.apiKey || "");
    } else {
      setSmitheryToolName("");
      setSmitheryToolSpec(null);
      setSmitheryApiKey("");
    }
    setSmitheryNeedsApiKey(false);
    setSmitherySearchQuery("");
    setSmitherySearchResults([]);
    setSelectedSmitheryServer(null);
    setServerToolList([]);
    setSelectedToolName("");
    setSmitheryFetchError("");
    setIsAddItemModalOpen(true);
  };

  const closeSmitheryModal = () => {
    setIsAddItemModalOpen(false);
    setSmitheryToolName("");
    setSmitheryToolSpec(null);
    setSmitheryFetchError("");
    setTargetDirId(null);
    setTargetItemId(null);
    setSmitherySearchQuery("");
    setSmitherySearchResults([]);
    setSelectedSmitheryServer(null);
    setServerToolList([]);
    setSelectedToolName("");
    setSmitheryApiKey("");
    setSmitheryNeedsApiKey(false);
  };

  // ── Smithery 서버 검색 ──
  const handleSmitherySearch = async () => {
    if (!smitherySearchQuery.trim()) return;
    setIsSearching(true);
    setSmitherySearchResults([]);
    setSmitheryFetchError("");
    setSelectedSmitheryServer(null);
    setServerToolList([]);
    setSelectedToolName("");
    setSmitheryToolSpec(null);
    setSmitheryNeedsApiKey(false);

    try {
      const servers = await Promise.race([
        searchSmitheryServers(smitherySearchQuery, 10),
        new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), 10000)),
      ]);
      if (!Array.isArray(servers)) throw new Error(servers?.error || servers?.message || "올바른 형태의 검색 응답이 아닙니다.");
      setSmitherySearchResults(servers);
      if (servers.length === 0) setSmitheryFetchError(`"${smitherySearchQuery}"에 대한 검색 결과가 없습니다.`);
    } catch (e) {
      const msg = e.message === "TIMEOUT" ? "서버 응답이 지연되었습니다." : e.message;
      setSmitheryFetchError("검색 실패: " + msg);
    } finally {
      setIsSearching(false);
    }
  };

  // ── 서버 선택 → 툴 목록 조회 ──
  const handleSelectSmitheryServer = async (server) => {
    setSelectedSmitheryServer(server);
    setSmitherySearchResults([]);
    setServerToolList([]);
    setSelectedToolName("");
    setSmitheryToolSpec(null);
    setSmitheryFetchError("");
    setSmitheryNeedsApiKey(false);
    setSmitheryApiKey("");
    setIsFetchingSpec(true);

    try {
      const tools = await Promise.race([
        fetchSmitheryTools(server.qualifiedName, {}, ""),
        new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), 10000)),
      ]);
      if (!Array.isArray(tools)) {
        const errMsg = String(tools?.error || tools?.message || "").toLowerCase();
        if (errMsg.includes("payment") || errMsg.includes("unauthorized") || errMsg.includes("401") || errMsg.includes("403") || errMsg.includes("api key"))
          throw new Error("NEEDS_PAYMENT");
        throw new Error(tools?.error || tools?.message || "서버에서 툴 목록 배열을 반환하지 않았습니다.");
      }
      setServerToolList(tools);
      if (tools.length === 0) setSmitheryFetchError("툴 목록이 비어있습니다. 툴 이름을 직접 입력하세요.");
    } catch (e) {
      setSmitheryNeedsApiKey(true);
      const msg = e.message || "";
      if (msg === "NEEDS_PAYMENT" || msg.includes("401") || msg.includes("403"))
        setSmitheryFetchError("이 서버는 API 키가 필요합니다. 아래에 키를 입력 후 재시도 버튼을 누르세요.");
      else if (msg === "TIMEOUT")
        setSmitheryFetchError("서버 연결 지연: API 키가 필요하거나 응답이 느립니다. 키를 입력 후 재시도 해보세요.");
      else
        setSmitheryFetchError(`서버 연결 실패 (${msg}). API 키 인증이 필요할 수 있습니다.`);
    } finally {
      setIsFetchingSpec(false);
    }
  };

  // ── API 키 입력 후 재시도 ──
  const handleRetryWithApiKey = async () => {
    if (!selectedSmitheryServer || !smitheryApiKey.trim()) return;
    setIsFetchingSpec(true);
    setSmitheryFetchError("");
    setServerToolList([]);
    setSelectedToolName("");
    setSmitheryToolSpec(null);

    try {
      const tools = await Promise.race([
        fetchSmitheryTools(selectedSmitheryServer.qualifiedName, {}, smitheryApiKey.trim()),
        new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), 10000)),
      ]);
      if (!Array.isArray(tools)) {
        const errMsg = String(tools?.error || tools?.message || "").toLowerCase();
        if (errMsg.includes("payment") || errMsg.includes("unauthorized") || errMsg.includes("401") || errMsg.includes("403") || errMsg.includes("api key"))
          throw new Error("NEEDS_PAYMENT");
        throw new Error(tools?.error || tools?.message || "서버에서 툴 목록 배열을 반환하지 않았습니다.");
      }
      setSmitheryNeedsApiKey(false);
      setServerToolList(tools);
      if (tools.length === 0) setSmitheryFetchError("툴 목록이 비어있습니다. 툴 이름을 직접 입력하세요.");
    } catch (e) {
      setSmitheryNeedsApiKey(true);
      const msg = e.message || "";
      if (msg === "NEEDS_PAYMENT" || msg.includes("401") || msg.includes("403"))
        setSmitheryFetchError("API 키가 올바르지 않거나 권한이 없습니다. 다시 확인해주세요.");
      else if (msg === "TIMEOUT")
        setSmitheryFetchError("서버 응답 지연: 다시 시도해주세요.");
      else
        setSmitheryFetchError(`재시도 실패: ${msg}`);
    } finally {
      setIsFetchingSpec(false);
    }
  };

  // ── 툴 선택 ──
  const handleSelectTool = (tool) => {
    setSelectedToolName(tool.name);
    setSmitheryToolName(tool.name);
    setSmitheryToolSpec(parseSmitheryToolSpec(tool));
  };

  // ── 툴 이름으로 직접 스펙 조회 ──
  const handleFetchSmitherySpec = async (toolName) => {
    if (!toolName.trim()) return;
    setIsFetchingSpec(true);
    setSmitheryFetchError("");
    setSmitheryToolSpec(null);

    try {
      const res = await Promise.race([
        fetch("http://localhost:3000/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolName: "list_tools", args: {} }),
        }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), 10000)),
      ]);
      const data = await res.json();
      const tools = data?.tools || data?.result?.tools || data?.content?.[0]?.tools || [];
      const found = tools.find(
        (t) => t.name === toolName.trim() || t.name.replace(/[^a-zA-Z0-9_]/g, "_") === toolName.trim()
      );
      if (found) {
        setSmitheryToolSpec(parseSmitheryToolSpec(found));
      } else {
        setSmitheryFetchError(`"${toolName}" 툴을 서버에서 찾을 수 없습니다. 파라미터를 직접 입력하세요.`);
        setSmitheryToolSpec({ description: "", parameters: [] });
      }
    } catch (e) {
      const msg = e.message === "TIMEOUT" ? "서버 응답 지연" : e.message;
      setSmitheryFetchError("조회 실패: " + msg + " — 파라미터를 직접 입력하세요.");
      setSmitheryToolSpec({ description: "", parameters: [] });
    } finally {
      setIsFetchingSpec(false);
    }
  };

  // ── 아이템 저장 ──
  const handleAddSmitheryItem = () => {
    if (!targetDirId || !smitheryToolName.trim()) return;
    const params = smitheryToolSpec?.parameters || [];
    const newItem = {
      id: targetItemId || `item_${Date.now()}`,
      name: smitheryToolName.trim(),
      url: "http://localhost:3000/api/execute",
      method: "POST",
      apiKey: smitheryApiKey,
      params,
      active: true,
      type: "smithery",
      description: smitheryToolSpec?.description || "",
      qualifiedName: selectedSmitheryServer?.qualifiedName || "",
    };

    const updatedDirs = mcpDirectories.map((dir) => {
      if (dir.id !== targetDirId) return dir;
      if (targetItemId) {
        return { ...dir, items: dir.items.map((item) => item.id === targetItemId ? newItem : item) };
      }
      return { ...dir, items: [...dir.items, newItem], active: true };
    });
    updateMcpData(updatedDirs);
    closeSmitheryModal();
  };

  // ── 초기화 ──
  const resetMcpState = () => updateMcpData([]);

  return {
    // state
    mcpDirectories, setMcpDirectories,
    mcpList, setMcpList,
    isInitialMcpLoaded, setIsInitialMcpLoaded,
    isAddDirModalOpen, setIsAddDirModalOpen,
    newDirName, setNewDirName,
    newDirDesc, setNewDirDesc,
    isAddItemModalOpen,
    targetDirId, targetItemId,
    smitherySearchQuery, setSmitherySearchQuery,
    smitherySearchResults,
    isSearching,
    smitheryToolName, setSmitheryToolName,
    smitheryToolSpec, setSmitheryToolSpec,
    isFetchingSpec,
    smitheryFetchError,
    selectedSmitheryServer, setSelectedSmitheryServer,
    serverToolList,
    selectedToolName,
    smitheryApiKey, setSmitheryApiKey,
    smitheryNeedsApiKey,
    // handlers
    updateMcpData,
    toggleDirectory,
    toggleDirectoryActive,
    handleDeleteDirectory,
    handleAddDirectory,
    toggleItemActive,
    handleDeleteApiItem,
    openSmitheryModal,
    closeSmitheryModal,
    handleSmitherySearch,
    handleSelectSmitheryServer,
    handleRetryWithApiKey,
    handleSelectTool,
    handleFetchSmitherySpec,
    handleAddSmitheryItem,
    resetMcpState,
  };
}
