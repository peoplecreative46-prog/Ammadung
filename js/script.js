const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];

const menuBtn=$("#menuBtn"), nav=$("#nav");
menuBtn?.addEventListener("click",()=>nav.classList.toggle("open"));
$$(".nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

document.addEventListener("mousemove",e=>{
  const g=$(".cursor-glow"); if(g){g.style.left=e.clientX+"px";g.style.top=e.clientY+"px";}
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")});
},{threshold:.12});
$$(".reveal").forEach(el=>observer.observe(el));

const counters=$$(".metrics [data-count]");
const counterObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target, target=+el.dataset.count, start=performance.now();
    const tick=t=>{
      const p=Math.min((t-start)/1100,1);
      el.textContent=Math.floor((1-Math.pow(1-p,3))*target);
      if(p<1)requestAnimationFrame(tick); else el.textContent=target+"+";
    };
    requestAnimationFrame(tick); counterObserver.unobserve(el);
  });
},{threshold:.8});
counters.forEach(el=>counterObserver.observe(el));

$$(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".filter").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
    const filter=btn.dataset.filter;
    $$(".pub-item").forEach(item=>item.classList.toggle("hidden",filter!=="all"&&item.dataset.year!==filter));
  });
});

$("#pdfBtn")?.addEventListener("click",()=>{
  window.print();
});

window.addEventListener("scroll",()=>{
  const header=$(".site-header");
  header?.classList.toggle("scrolled",window.scrollY>20);
});

/* Flyer gallery — Instagram-style */
(()=>{
  const grid=$("#flyerGrid"), lightbox=$("#flyerLightbox"), emptyMsg=$("#galleryEmpty");
  if(!grid)return;

  const posts=[...grid.querySelectorAll(".ig-post")].filter(p=>{
    const img=p.querySelector("img");
    img?.addEventListener("error",()=>{p.classList.add("is-placeholder");});
    img?.addEventListener("load",()=>{p.classList.remove("is-placeholder");checkEmpty();});
    return img;
  });

  const checkEmpty=()=>{
    const loaded=posts.filter(p=>!p.classList.contains("is-placeholder")&&p.querySelector("img")?.complete&&p.querySelector("img")?.naturalWidth>0);
    if(emptyMsg)emptyMsg.hidden=loaded.length>0;
  };
  setTimeout(checkEmpty,400);

  const likes=new Set(JSON.parse(localStorage.getItem("flyerLikes")||"[]"));
  const saveLikes=()=>localStorage.setItem("flyerLikes",JSON.stringify([...likes]));

  const syncLikeUI=(idx,btn)=>{
    const on=likes.has(idx);
    btn?.classList.toggle("liked",on);
    return on;
  };

  posts.forEach(p=>{
    const idx=+p.dataset.index;
    syncLikeUI(idx,p.querySelector(".ig-like-btn"));
    p.querySelector(".ig-like-btn")?.addEventListener("click",e=>{
      e.stopPropagation(); toggleLike(idx,p);
    });
  });

  const toggleLike=(idx,postEl)=>{
    likes.has(idx)?likes.delete(idx):likes.add(idx);
    saveLikes();
    syncLikeUI(idx,postEl?.querySelector(".ig-like-btn"));
    burstHeart(postEl);
  };

  const burstHeart=el=>{
    if(!el)return;
    el.classList.remove("heart-pop");
    void el.offsetWidth;
    el.classList.add("heart-pop");
  };

  let current=0, lastTap=0;

  const lbImg=lightbox?.querySelector(".ig-lightbox-inner img");
  const lbLike=lightbox?.querySelector(".ig-lightbox-like");
  const lbCount=lightbox?.querySelector(".ig-like-count");
  const visiblePosts=()=>posts.filter(p=>!p.classList.contains("is-placeholder")||p.querySelector("img")?.naturalWidth>0);

  const updateLbLike=()=>{
    const on=syncLikeUI(current,lbLike);
    if(lbCount)lbCount.textContent=(on?1:0)+" suka";
  };

  const openLightbox=idx=>{
    const list=visiblePosts().length?visiblePosts():posts;
    current=idx;
    const post=list.find(p=>+p.dataset.index===idx)||list[0];
    if(!post||!lbImg)return;
    current=+post.dataset.index;
    lbImg.src=post.querySelector("img").src;
    lbImg.alt=post.querySelector("img").alt;
    lightbox.hidden=false;
    lightbox.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    updateLbLike();
  };

  const closeLightbox=()=>{
    lightbox.hidden=true;
    lightbox.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  };

  const stepLightbox=dir=>{
    const list=visiblePosts().length?visiblePosts():posts;
    const i=list.findIndex(p=>+p.dataset.index===current);
    const next=list[(i+dir+list.length)%list.length];
    if(next)openLightbox(+next.dataset.index);
  };

  posts.forEach(p=>{
    p.addEventListener("click",e=>{
      if(e.target.closest(".ig-like-btn"))return;
      const now=Date.now();
      if(now-lastTap<320){toggleLike(+p.dataset.index,p);lastTap=0;return;}
      lastTap=now;
      setTimeout(()=>{if(lastTap===now)openLightbox(+p.dataset.index);},320);
    });
  });

  lbLike?.addEventListener("click",()=>{
    const post=posts.find(p=>+p.dataset.index===current);
    toggleLike(current,post);
    updateLbLike();
    syncLikeUI(current,post?.querySelector(".ig-like-btn"));
  });

  lightbox?.querySelector(".ig-lightbox-close")?.addEventListener("click",closeLightbox);
  lightbox?.querySelector(".ig-lightbox-prev")?.addEventListener("click",()=>stepLightbox(-1));
  lightbox?.querySelector(".ig-lightbox-next")?.addEventListener("click",()=>stepLightbox(1));
  lightbox?.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox();});

  document.addEventListener("keydown",e=>{
    if(lightbox?.hidden)return;
    if(e.key==="Escape")closeLightbox();
    if(e.key==="ArrowLeft")stepLightbox(-1);
    if(e.key==="ArrowRight")stepLightbox(1);
  });
})();
