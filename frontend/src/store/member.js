import { csrfFetch } from "./csrf";

const GET = "member/allMembers";
const STATUS = "member/getStatus";

// action creator: get all members
const get = (members) => {
  return {
    type: GET,
    members,
  };
};

const getStatus = (status) => {
  return {
    type: STATUS,
    status,
  };
};

// thunk: get all members by groupId
export const getAllMembers = (groupId) => async (dispatch) => {
  const response = await fetch(`/api/groups/${groupId}/members`);
  const members = await response.json();

  console.log("members in get all members thunk", members);

  if (response.ok) {
    // const members = await response.json();
    // console.log(members);
    await dispatch(get(members.Members));
    return members.Members;
  } else {
    return members;
  }
};

// thunk: request to join a group with groupId and login;
export const requestMembership = (groupId) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}/membership`, {
    method: "POST",
  });
  const member = await response.json();
  console.log("new member in thunk", member);
  if (response.ok) {
    await dispatch(getAllMembers(groupId));
    return member;
  }
};

// thunk: get the stutas of current user in specific group
export const getStatusThunk = (groupId) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}/status`);

  if (response.ok) {
    const status = await response.json();

    console.log("status in thunk-------", status);
    await dispatch(getStatus(status));
  }
};

// thunk: change the status for specified group by id;
export const changeStatusThunk = (groupId, updates) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}/membership`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (response.ok) {
    await dispatch(getAllMembers(groupId));
  }
};

// thunk: delete membership to a group specified by id
export const deleteMembershipThunk =
  (groupId, memberId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/membership`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberId }),
    });

    if (response.ok) {
      await dispatch(getAllMembers(groupId));
    }
  };

// reducer
// const initialState = { allMembers: {}, singleMember: {} };

const memberReducer = (state = {}, action) => {
  let newState;
  switch (action.type) {
    case GET:
      const allMembers = {};
      //   console.log(newState);
      console.log(action.members, "==============");
      action.members.forEach((member) => {
        allMembers[member.id] = member;
      });
      newState = { ...state, allMembers: allMembers };
      return newState;
    case STATUS:
      // const currentState = {};

      newState = { ...state, status: action.status };
      // console.log("new state in status", newState);
      return newState;
    // case GETONE:
    //   const singleMember = {};
    //   singleMember[action.member.memberId] = action.member;
    //   newState = { ...state, singleMember: singleMember };
    //   return newState;
    default:
      return state;
  }
};

export default memberReducer;
