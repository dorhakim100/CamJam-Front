declare module '*.jsx' {
    import React from 'react';
    const Component: React.ComponentType<any>;
    export default Component;
  }
  

  declare module '../reducers/game.reducer' {
    const value: any;
    export default value;
  }


  declare module '../reducers/user.reducer.js' {
    const value: any;
    export default value;
  }
  
  declare module '../reducers/system.reducer.js' {
    const value: any;
    export default value;
  }

  declare module '../services/game/game.service.js' {
    const value: any;
    export default value;
  }
  
  // declare module '../services/game/game.service.js' {
    // export function gameService(...args: any[]): any;
    // export const gameService: any;
    // export function gameService(...args: any[]): any;

  // }
  