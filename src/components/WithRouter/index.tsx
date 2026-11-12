import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { NavigateFunction, Params } from 'react-router-dom';

interface Props {
  // 传递给被包裹组件的 props
  [key: string]: any;
}

interface IRoute {
  navigate: NavigateFunction;
  params: Readonly<Params<string>>;
}

export type IRouteProps = {
  route: IRoute;
};

// 用于包裹类组件的高阶组件
const withRouter = <P extends object>(Component: React.ComponentType<P>) => {
  // 返回一个新的组件
  const route = (props: Props) => {
    const navigate = useNavigate();
    const params = useParams();
    const route = {
      navigate,
      params,
    };
    return <Component {...(props as P)} route={route} />;
  };

  return route;
};

export default withRouter;
