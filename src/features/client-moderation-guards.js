// Isolated client moderation guard helpers.
function isBannedClient(){
  if(PROF && PROF.is_banned === true){
    toast('🚫 Your account is suspended.');
    return true;
  }
  return false;
}

function isMsgBannedClient(){
  if(PROF && PROF.is_msg_banned === true){
    toast('🚫 You are restricted from sending messages.');
    return true;
  }
  return false;
}
