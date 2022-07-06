import { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Breadcrumb,
  Button,
  Statistic,
  Row,
  Col,
  Table,
  Tag,
  Spin,
  Popconfirm,
  Card,
  Progress,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  DeleteOutlined,
  RollbackOutlined,
  UndoOutlined,
  PoweroffOutlined,
  CaretRightOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
  ProfileOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { LazyLog } from "react-lazylog";
import styled from "styled-components";
import { uptimeConverter, formatBytes } from "./utils/formatters";
import { getList } from "./services/list";
import {
  stopProcess,
  startProcess,
  restartProcess,
  reloadProcess,
  deleteProcess,
} from "./services/process";
import AddNewProcess from "./modules/AddNewProcess";

const { Header, Content, Footer } = Layout;

const statusColorMap = {
  online: "green",
  errored: "red",
  stopped: "red",
  stopping: "yellow",
  launching: "yellow",
  "one-launch-status": "yellow",
  "waiting restart": "yellow",
};

const Container = styled.div`
  height: 100%;

  .ant-layout {
    height: 100%;
  }
`;

const Logo = styled.div`
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
`;

const StyleContent = styled(Content)`
  padding: 0 50px;
`;

const StyleButton = styled(Button)`
  margin-right: 10px;
`;

const Monitoring = styled(Card)`
  display: flex;
  height: 100%;
  border: 1px solid rgba(0, 40, 100, 0.12);
  justify-content: center;

  .ant-card-body {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .ant-statistic {
    height: fit-content;
  }

  .ant-statistic-title {
    text-align: center;
  }
`;

const MainContent = styled.div`
  background-color: white;
  padding: 25px;
  margin-top: 25px;
  border: 1px solid rgba(0, 40, 100, 0.12);
  min-height: 400px;
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  margin: 16px 0;
`;

const LoggerContainer = styled.div`
  & > div {
    height: 500px !important;
  }
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
`;

const ListHeader = styled.div`
  display: flex;

  div {
    margin-left: auto;
  }
`;

var evtSource = new EventSource("http://localhost:8080/logs");

const logs = [];

function App() {
  const queryClient = useQueryClient();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    let timeout;
    evtSource.onmessage = function (e) {
      clearTimeout(timeout);
      logs.push(e.data);
      setTimeout(() => {
        setReload(true);
      }, 100);
    };

    evtSource.onerror = function (e) {
      console.log("EventSource failed.");
    };
  }, []);

  const { isLoading, error, data } = useQuery("list", getList, {
    refetchInterval: 1000 * 10, // 10 sec
  });

  const stopAction = useMutation(stopProcess, {
    onSuccess: async () => {
      await queryClient.refetchQueries(["list"], { active: true });
    },
  });
  const startAction = useMutation(startProcess, {
    onSuccess: async () => {
      await queryClient.refetchQueries(["list"], { active: true });
    },
  });

  const restartAction = useMutation(restartProcess, {
    onSuccess: async () => {
      await queryClient.refetchQueries(["list"], { active: true });
    },
  });

  const reloadAction = useMutation(reloadProcess, {
    onSuccess: async () => {
      await queryClient.refetchQueries(["list"], { active: true });
    },
  });

  const deleteAction = useMutation(deleteProcess, {
    onSuccess: async () => {
      await queryClient.refetchQueries(["list"], { active: true });
    },
  });

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  const columns = [
    {
      key: "view",
      width: 50,
      render: (_text, record) => (
        <div>
          <>
            <StyleButton shape="circle" icon={<EyeOutlined />} />
          </>
        </div>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag color={statusColorMap[text]} key={text}>
          {text.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Uptime",
      dataIndex: "uptime",
      key: "uptime",
      render: (text) => (
        <>
          <ClockCircleOutlined /> {uptimeConverter(text)}
        </>
      ),
    },
    {
      title: "Memory",
      dataIndex: "memory",
      key: "memory",
      render: (text) => formatBytes(text),
    },
    {
      title: "CPU",
      dataIndex: "cpu",
      key: "cpu",
      render: (text) => `${text}%`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_text, record) => (
        <div>
          <>
            <StyleButton
              shape="circle"
              style={{ color: "green" }}
              icon={<CaretRightOutlined />}
              onClick={() => startAction.mutate(record.id)}
            />
            <StyleButton
              shape="circle"
              style={{ color: "red" }}
              icon={<PoweroffOutlined />}
              onClick={() => stopAction.mutate(record.id)}
            />
            <StyleButton
              shape="circle"
              style={{ color: "orange" }}
              icon={<UndoOutlined />}
              onClick={() => reloadAction.mutate(record.id)}
            />
            <StyleButton
              shape="circle"
              icon={<RollbackOutlined />}
              onClick={() => restartAction.mutate(record.id)}
            />
          </>
        </div>
      ),
    },
    {
      title: "Remove process",
      key: "delete",
      render: (_text, record) => (
        <div>
          <Popconfirm
            title="Are you sure ? "
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteAction.mutate(record.id)}
          >
            <StyleButton style={{ color: "red" }} icon={<DeleteOutlined />}>
              Remove
            </StyleButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Container>
      <Layout className="layout">
        <Header>
          <Logo />
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key={1}>Dashboard</Menu.Item>
            <Menu.Item key={2}>Settings</Menu.Item>
          </Menu>
        </Header>
        <StyleContent>
          <StyledBreadcrumb>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </StyledBreadcrumb>
          <br />
          <Content>
            <Row gutter={16}>
              <Col span={6}>
                <Monitoring>
                  <Statistic
                    title="Running Apps"
                    value=" "
                    valueStyle={{ color: "#3f8600" }}
                    prefix={
                      <Progress
                        type="circle"
                        percent={(
                          (data.totalOnlineProcesses * 100) /
                          data.list.length
                        ).toFixed(2)}
                        strokeColor="#52c41a"
                        format={() => (
                          <div>
                            {data.totalOnlineProcesses} / {data.list.length}
                          </div>
                        )}
                      />
                    }
                  />
                </Monitoring>
              </Col>
              <Col span={6}>
                <Monitoring>
                  <Statistic
                    title="Stopped Apps"
                    value=" "
                    valueStyle={{ color: "#cf1322" }}
                    prefix={
                      <Progress
                        type="circle"
                        percent={(
                          (data.totalStoppedProcesses * 100) /
                          data.list.length
                        ).toFixed(2)}
                        strokeColor="#cf1322"
                        format={() => (
                          <div>
                            {data.totalStoppedProcesses} / {data.list.length}
                          </div>
                        )}
                      />
                    }
                  />
                </Monitoring>
              </Col>
              <Col span={6}>
                <Monitoring>
                  <Statistic
                    title="Memory usage"
                    value=" "
                    prefix={
                      <Progress
                        type="circle"
                        percent={(
                          (data.totalMemory * 100) /
                          data.systemMemory
                        ).toFixed(2)}
                        format={() =>
                          `${(
                            (data.totalMemory * 100) /
                            data.systemMemory
                          ).toFixed(2)}%`
                        }
                      />
                    }
                  />
                </Monitoring>
              </Col>
              <Col span={6}>
                <Monitoring>
                  <Statistic
                    title="CPU usage"
                    value=" "
                    prefix={
                      <Progress
                        type="circle"
                        percent={data.totalCPU}
                        format={() => `${data.totalCPU}%`}
                      />
                    }
                  />
                </Monitoring>
              </Col>
            </Row>
          </Content>
          <br />
          <MainContent>
            <ListHeader>
              <h2>
                {" "}
                <ProfileOutlined /> Processes list
              </h2>
              <AddNewProcess data={data} />
            </ListHeader>
            <br />
            <br />
            <Table
              dataSource={data.list}
              columns={columns}
              scroll={{ x: 1300 }}
            />
          </MainContent>
          <MainContent>
            <h2>
              {" "}
              <NotificationOutlined /> Logs
            </h2>
            {Boolean(logs.length) ? (
              <LoggerContainer>
                <LazyLog extraLines={0} text={logs.join("\n")} follow stream />
              </LoggerContainer>
            ) : (
              <Center>
                <Spin />
              </Center>
            )}
          </MainContent>
        </StyleContent>

        <Footer style={{ textAlign: "center" }}>
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </Container>
  );
}

export default App;
