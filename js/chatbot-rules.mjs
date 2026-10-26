export const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function findNode(input,flow) {
  const query=normalize(input);if(!query)return null;
  return Object.entries(flow.nodes).flatMap(([id,node],order)=>(node.keywords||[]).map(keyword=>({id,keyword:normalize(keyword),order})))
    .filter(item=>item.keyword && query.includes(item.keyword)).sort((a,b)=>b.keyword.length-a.keyword.length||a.order-b.order)[0]?.id || null;
}
export function restoreSession(raw,flow) {
  try {
    const s=JSON.parse(raw);
    if(s.version!==flow.version || !flow.nodes[s.node] || !Array.isArray(s.path) || !s.path.length || s.path.length>80 || s.path[0]!==flow.start || s.path.at(-1)!==s.node || s.path.some(id=>!Object.hasOwn(flow.nodes,id)))return null;
    if(!Array.isArray(s.messages)||!s.messages.length||s.messages.length>160||s.messages.some(m=>!['user','bot'].includes(m.role)||typeof m.text!=='string'||m.text.length>2500))return null;
    return {version:flow.version,node:s.node,path:s.path,messages:s.messages,open:s.open===true};
  }catch{return null;}
}
