import React, {FC} from 'react';
import {PageWrapperProps} from "@/types/page-wrapper";
import './PageWrapper.scss'

const PageWrapper:FC<PageWrapperProps> = ({children}) => {
    return (
        <main className="page-wrapper">
            <div className="page-wrapper__content">
                {children}
            </div>
        </main>
    );
};

export default PageWrapper;