import ctftime from "../src/services/ctftime";
import "mocha";
import {expect} from "chai";


describe("CTFTime", () => {
    describe("#events()", () => {
        it("should return the value as described in CTFTime API page", async () => {
            const expected =
                [
                    {
                        "organizers": [
                            {
                                "id": 10498,
                                "name": "th3jackers"
                            }
                        ],
                        "onsite": false,
                        "finish": "2015-01-24T08:00:00+00:00",
                        "description": "Registration will be open when CTF Start\r\n#WCTF #th3jackers\r\nhttp://ctf.th3jackers.com/",
                        "weight": 5.00,
                        "title": "WCTF  - th3jackers",
                        "url": "http://ctf.th3jackers.com/",
                        "is_votable_now": false,
                        "restrictions": "Open",
                        "format": "Jeopardy",
                        "start": "2015-01-23T20:00:00+00:00",
                        "participants": 18,
                        "ctftime_url": "https://ctftime.org/event/190/",
                        "location": "",
                        "live_feed": "",
                        "public_votable": false,
                        "duration": {
                            "hours": 12,
                            "days": 0
                        },
                        "logo": "",
                        "format_id": 1,
                        "id": 190,
                        "ctf_id": 93
                    }
                ];
            const start = 1422019499;
            const finish = 1423029499;
            const limit = 100;

            const actual = await ctftime.events(start, finish, limit);
            expect(actual).to.be.deep.equal(expected);
        });
    });
});