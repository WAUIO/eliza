declare namespace JSX {
    interface IntrinsicElements {
        'log-terminal': React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement> & {
                'ws-url'?: string;
            },
            HTMLElement
        >;
    }
}