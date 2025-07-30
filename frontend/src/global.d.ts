declare global {
  var google: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
        }) => void;
        renderButton: (props: {
          container: string;
          theme?: string;
          size?: string;
          text?: string;
          shape?: string;
        }) => void;
        disableAutoSelect: () => void;
      };
    };
  };
}

export {};