// Follower/subscriber counters belong only on the dedicated /start/ pages.
// Do not inject them into the normal multilingual quote website pages.
export async function injectLocaleFollowers(response,url){
  return response;
}

// Preserve the normal site root. The Worker must no longer replace `/` with a follower dashboard.
export function mainFollowerDashboard(){
  return null;
}
