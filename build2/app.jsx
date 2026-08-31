const { useEffect, useMemo, useState } = React;

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const regions = [
  {code:"",name:"전체"},{code:"1",name:"서울"},{code:"2",name:"인천"},{code:"3",name:"대전"},
  {code:"4",name:"대구"},{code:"5",name:"광주"},{code:"6",name:"부산"},{code:"7",name:"울산"},
  {code:"8",name:"세종"},{code:"31",name:"경기"},{code:"32",name:"강원"},{code:"33",name:"충북"},
  {code:"34",name:"충남"},{code:"35",name:"경북"},{code:"36",name:"경남"},{code:"37",name:"전북"},
  {code:"38",name:"전남"},{code:"39",name:"제주"}
];

const mockFestivals = [
  {contentid:"demo-1",title:"서울 빛 문화축제",addr1:"서울특별시 종로구",firstimage:"https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80",eventstartdate:"20260820",eventenddate:"20260910",areacode:"1",tel:"02-000-0000",overview:"서울 도심에서 빛과 문화 콘텐츠를 함께 즐길 수 있는 예시 축제 데이터입니다.",eventplace:"청계광장 일대"},
  {contentid:"demo-2",title:"부산 바다 문화제",addr1:"부산광역시 해운대구",firstimage:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",eventstartdate:"20260901",eventenddate:"20260915",areacode:"6",tel:"051-000-0000",overview:"해변에서 공연과 체험 프로그램을 즐길 수 있는 예시 데이터입니다.",eventplace:"해운대 해수욕장"},
  {contentid:"demo-3",title:"제주 가을 자연축제",addr1:"제주특별자치도 제주시",firstimage:"https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=900&q=80",eventstartdate:"20261003",eventenddate:"20261020",areacode:"39",tel:"064-000-0000",overview:"제주의 자연과 지역 문화를 소개하는 예시 축제 데이터입니다.",eventplace:"제주시 일대"},
  {contentid:"demo-4",title:"대전 과학 문화축제",addr1:"대전광역시 유성구",firstimage:"https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",eventstartdate:"20260912",eventenddate:"20260920",areacode:"3",tel:"042-000-0000",overview:"과학 체험과 전시를 즐길 수 있는 예시 축제 데이터입니다.",eventplace:"엑스포과학공원"}
];

function apiKey(){ return window.APP_CONFIG?.PUBLIC_DATA_API_KEY?.trim() || ""; }
function todayApi(){ const d=new Date(); return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`; }
function fmt(v){ return v && v.length===8 ? `${v.slice(0,4)}.${v.slice(4,6)}.${v.slice(6,8)}` : (v||"일정 미정"); }
function statusOf(f){ const n=todayApi(); if(f.eventstartdate>n)return "upcoming"; if(f.eventenddate<n)return "ended"; return "ongoing"; }

async function request(endpoint, params={}){
  if(!apiKey()) throw new Error("API_KEY_MISSING");
  const q=new URLSearchParams({serviceKey:apiKey(),MobileOS:"ETC",MobileApp:"FestOn",_type:"json",...params});
  const url=`${BASE_URL}/${endpoint}?${q.toString()}`;
  console.log("[TourAPI 요청]", url.replace(apiKey(),"***API_KEY***"));
  const res=await fetch(url);
  if(!res.ok) throw new Error(`HTTP_${res.status}`);
  const data=await res.json();
  console.log("[TourAPI 전체 응답]",data);
  return data;
}

async function fetchFestivals(){
  const data=await request("searchFestival2",{numOfRows:"100",pageNo:"1",arrange:"R",eventStartDate:todayApi()});
  const items=data?.response?.body?.items?.item||[];
  console.log("[사용할 축제 배열]",items);
  return Array.isArray(items)?items:[items];
}

async function fetchDetail(id){
  const common=await request("detailCommon2",{contentId:id,defaultYN:"Y",firstImageYN:"Y",addrinfoYN:"Y",overviewYN:"Y",mapinfoYN:"Y"});
  const intro=await request("detailIntro2",{contentId:id,contentTypeId:"15"});
  const detail={...(common?.response?.body?.items?.item?.[0]||{}),...(intro?.response?.body?.items?.item?.[0]||{})};
  console.log("[상세 화면 통합 데이터]",detail);
  return detail;
}

function Header({title="FestOn",onBack}){return <header className="app-header">{onBack?<button className="icon-button" onClick={onBack}>←</button>:<span className="header-spacer"/>}<h1>{title}</h1><span className="header-spacer"/></header>}
function BottomNav({current,onNavigate}){const a=[["home","⌂","홈"],["search","⌕","축제찾기"],["favorites","♡","찜"],["my","☺","MY"]];return <nav className="bottom-nav">{a.map(([id,icon,label])=><button key={id} className={current===id?"active":""} onClick={()=>onNavigate(id)}><span>{icon}</span><small>{label}</small></button>)}</nav>}
function Card({festival,onDetail,favorite,onFavorite}){return <article className="festival-card" onClick={()=>onDetail(festival)}><div className="festival-image-wrap">{festival.firstimage?<img className="festival-image" src={festival.firstimage} alt={festival.title}/>:<div className="no-image">FestOn</div>}<button className={`heart-button ${favorite?"selected":""}`} onClick={e=>{e.stopPropagation();onFavorite(festival)}}>{favorite?"♥":"♡"}</button></div><div className="festival-card-body"><h3>{festival.title||"축제명 미정"}</h3><p className="address">{festival.addr1||"주소 정보 없음"}</p><p className="date">{fmt(festival.eventstartdate)} ~ {fmt(festival.eventenddate)}</p></div></article>}

function Home({festivals,favorites,onNavigate,onDetail,onFavorite,dataMode}){return <div className="screen"><Header/><main className="page-content home-page"><section className="hero"><p className="eyebrow">이번 주 어디 갈까?</p><h2>우리 지역의 축제를<br/>한눈에 찾아보세요.</h2><button className="primary-button" onClick={()=>onNavigate("search")}>축제 찾아보기</button></section>{dataMode==="demo"&&<div className="notice">현재 API 키가 없어 예제 데이터로 실행 중입니다.</div>}<section className="section-block"><div className="section-title-row"><h2>인기 지역</h2><button className="text-button" onClick={()=>onNavigate("search")}>전체보기</button></div><div className="region-scroll">{regions.slice(1,9).map(r=><button key={r.code} onClick={()=>onNavigate("search",{region:r.code})}>{r.name}</button>)}</div></section><section className="section-block"><div className="section-title-row"><h2>추천 축제</h2><span>{festivals.length}개</span></div><div className="card-list">{festivals.slice(0,4).map(f=><Card key={f.contentid} festival={f} onDetail={onDetail} onFavorite={onFavorite} favorite={favorites.some(x=>x.contentid===f.contentid)}/>)}</div></section></main><BottomNav current="home" onNavigate={onNavigate}/></div>}

function Search({festivals,favorites,onNavigate,onDetail,onFavorite,initialRegion}){const[keyword,setKeyword]=useState("");const[region,setRegion]=useState(initialRegion||"");const[status,setStatus]=useState("all");const filtered=useMemo(()=>festivals.filter(f=>(f.title||"").toLowerCase().includes(keyword.toLowerCase().trim())&&(!region||f.areacode===region)&&(status==="all"||statusOf(f)===status)),[festivals,keyword,region,status]);return <div className="screen"><Header title="축제찾기"/><main className="page-content"><div className="search-box"><span>⌕</span><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="축제명을 검색하세요"/></div><section className="filter-section"><h2>지역</h2><div className="chip-group">{regions.map(r=><button key={r.code} className={region===r.code?"selected":""} onClick={()=>setRegion(r.code)}>{r.name}</button>)}</div></section><section className="filter-section"><h2>상태</h2><div className="chip-group">{[["all","전체"],["ongoing","진행중"],["upcoming","예정"]].map(([id,label])=><button key={id} className={status===id?"selected":""} onClick={()=>setStatus(id)}>{label}</button>)}</div></section><div className="result-heading"><strong>검색 결과</strong><span>{filtered.length}건</span></div>{filtered.length===0?<div className="empty-state"><div>⌕</div><h3>검색 결과가 없습니다.</h3><p>검색어나 필터 조건을 변경해보세요.</p></div>:<div className="card-list">{filtered.map(f=><Card key={f.contentid} festival={f} onDetail={onDetail} onFavorite={onFavorite} favorite={favorites.some(x=>x.contentid===f.contentid)}/>)}</div>}</main><BottomNav current="search" onNavigate={onNavigate}/></div>}

function Detail({festival,onBack,favorite,onFavorite}){if(!festival)return null;return <div className="screen"><Header title="축제 상세" onBack={onBack}/><main className="detail-page"><div className="detail-image-wrap">{festival.firstimage?<img src={festival.firstimage} alt={festival.title}/>:<div className="detail-no-image">FestOn</div>}<button className={`detail-heart ${favorite?"selected":""}`} onClick={()=>onFavorite(festival)}>{favorite?"♥":"♡"}</button></div><section className="detail-content"><span className="category-badge">지역축제</span><h2>{festival.title}</h2><p className="detail-date">{fmt(festival.eventstartdate)} ~ {fmt(festival.eventenddate)}</p><div className="info-box"><div><b>장소</b><span>{festival.eventplace||festival.addr1||"정보 없음"}</span></div><div><b>주소</b><span>{festival.addr1||"정보 없음"}</span></div><div><b>문의</b><span>{festival.tel||"정보 없음"}</span></div></div><section className="description-section"><h3>축제 소개</h3><p>{festival.overview||"상세 소개 정보가 제공되지 않았습니다."}</p></section></section></main></div>}

function Favorites({favorites,onNavigate,onDetail,onFavorite}){return <div className="screen"><Header title="찜한 축제"/><main className="page-content"><div className="result-heading"><strong>내가 저장한 축제</strong><span>{favorites.length}건</span></div>{favorites.length===0?<div className="empty-state"><div>♡</div><h3>찜한 축제가 없습니다.</h3><p>관심 있는 축제의 하트를 눌러 저장해보세요.</p><button className="primary-button small" onClick={()=>onNavigate("search")}>축제 찾아보기</button></div>:<div className="card-list">{favorites.map(f=><Card key={f.contentid} festival={f} onDetail={onDetail} onFavorite={onFavorite} favorite={true}/>)}</div>}</main><BottomNav current="favorites" onNavigate={onNavigate}/></div>}
function MyPage({onNavigate,dataMode}){return <div className="screen"><Header title="MY"/><main className="page-content"><section className="profile-card"><div className="avatar">F</div><div><h2>FestOn 이용자</h2><p>지역축제를 쉽고 빠르게 찾아보세요.</p></div></section><section className="my-menu"><button onClick={()=>onNavigate("favorites")}><span>♡ 찜한 축제</span><b>›</b></button><div><span>데이터 상태</span><b>{dataMode==="api"?"공공데이터 API":"예제 데이터"}</b></div><div><span>앱 버전</span><b>1.0.0</b></div></section><div className="api-help"><h3>API 키 설정</h3><p>Node.js 없이 <code>build/config.js</code>의 <code>PUBLIC_DATA_API_KEY</code> 값만 수정하면 됩니다.</p></div></main><BottomNav current="my" onNavigate={onNavigate}/></div>}

function App(){const[screen,setScreen]=useState("home");const[searchRegion,setSearchRegion]=useState("");const[festivals,setFestivals]=useState([]);const[selected,setSelected]=useState(null);const[favorites,setFavorites]=useState(()=>{try{return JSON.parse(localStorage.getItem("feston-favorites"))||[]}catch{return[]}});const[loading,setLoading]=useState(true);const[error,setError]=useState("");const[dataMode,setDataMode]=useState("api");
useEffect(()=>{(async()=>{try{setFestivals(await fetchFestivals());setDataMode("api")}catch(err){console.error("[축제 데이터 오류]",err);setFestivals(mockFestivals);setDataMode("demo");setError(err.message==="API_KEY_MISSING"?"API 키가 없어 예제 데이터로 표시합니다.":"API 또는 네트워크 오류가 발생해 예제 데이터로 표시합니다.")}finally{setLoading(false)}})()},[]);
useEffect(()=>localStorage.setItem("feston-favorites",JSON.stringify(favorites)),[favorites]);
function nav(next,opt={}){if(next==="search")setSearchRegion(opt.region||"");setScreen(next);window.scrollTo(0,0)}
async function openDetail(f){setSelected(f);setScreen("detail");window.scrollTo(0,0);if(dataMode==="api"){try{setSelected({...f,...await fetchDetail(f.contentid)})}catch(e){console.error("[상세 데이터 오류]",e)}}}
function toggle(f){setFavorites(p=>p.some(x=>x.contentid===f.contentid)?p.filter(x=>x.contentid!==f.contentid):[...p,f])}
if(loading)return <div className="loading-screen"><div className="loader"/><h1>FestOn</h1><p>축제 정보를 불러오고 있습니다.</p></div>;
const common={festivals,favorites,onNavigate:nav,onDetail:openDetail,onFavorite:toggle,dataMode};return <div className="app-shell">{error&&<div className="top-error" onClick={()=>setError("")}>{error}<b>×</b></div>}{screen==="home"&&<Home {...common}/>} {screen==="search"&&<Search {...common} initialRegion={searchRegion}/>} {screen==="favorites"&&<Favorites {...common}/>} {screen==="my"&&<MyPage onNavigate={nav} dataMode={dataMode}/>} {screen==="detail"&&<Detail festival={selected} onBack={()=>nav("home")} onFavorite={toggle} favorite={favorites.some(x=>x.contentid===selected?.contentid)}/>}</div>}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
