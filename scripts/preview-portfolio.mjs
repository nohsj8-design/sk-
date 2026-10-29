// Local preview with a public-file allowlist: never serve .env or Git files.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.mp3':'audio/mpeg','.mp4':'video/mp4'};
http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';
    const parts=name.split(/[\\/]/);const ext=path.extname(name).toLowerCase();
    if(parts.some(p=>p.startsWith('.')||p==='..')||!mime[ext]||!(parts.length===1&&ext==='.html'||['assets','css','js','sns-dashboard'].includes(parts[0]))){res.writeHead(404);return res.end();}
    const target=path.resolve(root,name);if(!target.startsWith(root+path.sep)){res.writeHead(404);return res.end();}
    const bytes=await fs.readFile(target);res.writeHead(200,{'Content-Type':mime[ext],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404);res.end();}
}).listen(4173,'127.0.0.1',()=>console.log('Safe portfolio preview: http://127.0.0.1:4173/report.html'));
