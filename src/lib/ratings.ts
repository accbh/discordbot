/*

    Name: Ratings.ts
    Version: 0.0.1
    Author: Harrison D.
    Date: 08/09/20
    Description: Defenitions for specificially the check command.

*/

export enum ATCRatings {
    SUSPENDED,
    OBSERVER,
    S1,
    S2,
    S3,
    C1,
    C2,
    C3,
    I1,
    I2,
    I3,
    SUPERVISOR,
    ADMINISTRATOR
}

export enum PilotRATINGS {
    P0 = "No Training",
    P1 = "Online Pilot",
    P2 =  "Flight Fundamentals",
    P3 = "VFR Pilot",
    P4 = "IFR Pilot",
    P5 = "Advanced IFR Pilot",
    P9 = "Pilot Flight Instructor"
}