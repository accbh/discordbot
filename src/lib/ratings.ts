/*

    Name: Ratings.ts
    Version: 0.0.1
    Author: Harrison D.
    Date: 08/09/20
    Description: Defenitions for specificially the check command.

*/

// C2 and I2 no longer used and have been removed
export enum ATCRatings {
    SUSPENDED,
    OBSERVER,
    S1,
    S2,
    S3,
    C1,
    C3,
    I1,
    I3,
    SUPERVISOR,
    ADMINISTRATOR
}

export enum PilotRatings {
    P0 =  'Basic VATSIM Pilot',
    P1 = 'Private Pilot License (PPL)',
    P2 = 'Instrument Rating (IR)',
    P3 = 'Commerical Multi-Engine License (CMEL)',
    P4 = 'Airline Transport License (ATPL)'
}
