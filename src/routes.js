import React from 'react';
import {IndexRoute, Route, Switch} from 'react-router';
import { getMeFromToken } from './redux/actions/auth';
import {
    App,
    Login,
    Admin,
    Clients,
    Client,
    ClientDashboard,
    CreatorDashboard,
    Admins,
    Report,
    TermsAndConditions,
    Reviewers,
    SocialMedia,
    Challenges,
    Rewards,
    ChallengesDetail,
    Uploads,
    SignUp,
    Brand,
    MyUploads,
    Creators,
    Widget,
    BrandAdmin,
    Accounts,
    ChangePwd,
    Configure,
    RewardAdmin,
    ChallengeDetailCreator,
    ChangePwdAdmin
 } from './components';

export default (store) => {
  return (
      <Route path="/" component={App}>
        { /* Creator area*/ }
        <IndexRoute component={Brand}/>
        <Route path="/dashboard" component={CreatorDashboard}/>
        <Route path="/brand" component={Brand}/>
        <Route path="/signup" component={SignUp}/>
        <Route path="/myuploads" component={MyUploads}/>
        <Route path=":clientName/:challengeName/detail" component={ChallengeDetailCreator}/>
        { /* Admin area*/ }
        <Route path="/admin">
          <IndexRoute component={Admin}/>
          <Route path="admins" component={Admins}/>
          <Route path="change-pwd" component={ChangePwdAdmin}/>
          <Route path="clients" component={Clients}/>
          <Route path="report/reviewers" component={Report}/>
          <Route path="report/accounts" component={BrandAdmin}/>  
          <Route path="report/accounts/:clientId/:brandName" component={Accounts}/>  
          <Route path="report/rewards" component={BrandAdmin}/>  
          <Route path="report/rewards/:clientId" component={RewardAdmin}/> 
        </Route>
         
       
        { /* Client area*/ }   
        <Route path="/client">
          <IndexRoute component={Client}/>
          <Route path=":shortName/dashboard" component={ClientDashboard}/>
          <Route path=":shortName/settings/reviewers" component={Reviewers}/>
          <Route path=":shortName/socialmedia" component={SocialMedia}/>         
          <Route path=":shortName/challenges" component={Challenges}/>
          <Route path=":shortName/challenges/:challengeId" component={ChallengesDetail}/>          
          <Route path=":shortName/rewards" component={Rewards}/>
          <Route path=":shortName/uploads" component={Uploads}/>
          <Route path=":shortName/uploads/:challengeId" component={Uploads}/>          
          <Route path=":shortName/settings/socialmedia" component={SocialMedia}/>
          <Route path=":shortName/settings/socialmedia/:twitterLogged" component={SocialMedia}/>
          <Route path=":shortName/creators" component={Creators}/>
          <Route path=":shortName/configure" component={Configure}/>
        </Route>
        
        { /* TermsAndConditions area*/ }    
        <Route path= "/to" component={TermsAndConditions}/> 
        <Route path= "/widget" component={Widget}/> 
        <Route path= "/widget?clientId=:clientId&challengeId=:challengeId&imageUri=:imageUri&challengeName=:challengeName&hashtags=:hashtags" component={Widget}/>
        {/* Forgot password area */}
        <Route path= "/creator/change-pwd/:token" component={ChangePwd}/>
      </Route>
        
  );
};
