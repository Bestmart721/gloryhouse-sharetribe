// const fetch = require("cross-fetch");

const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzE5NDIzNDI4LCJvcmdhbml6YXRpb25JZCI6MjM1NTEwLCJqdGkiOiIwMjcwM2ZhYy1jNWI4LTRjMDUtOTVmYy1jYzYyMTY4Y2IwY2QifQ.uht1qw666c3fwbXHS8igcRORjb1gbSjx5B2i-4T4UiA";

const data = {
  endDate: "2099-02-18T14:23:00.000Z",
  fields: ["hostRoomUrl"],
};

function getResponse() {
    return fetch("https://api.whereby.dev/v1/meetings", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

getResponse().then(async res => {
    console.log("Status code:", res.status);
    const data = await res.json();
    console.log("Room URL:", data.roomUrl);
    console.log("Host room URL:", data.hostRoomUrl);
});
