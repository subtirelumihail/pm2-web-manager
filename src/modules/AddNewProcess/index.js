import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Button,
  Modal,
  Form,
  Input,
  Tabs,
  Divider,
  Collapse,
  Select,
  Switch,
} from "antd";
import {
  ThunderboltOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  PullRequestOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import CodeEditor from "@uiw/react-textarea-code-editor";
import styled from "styled-components";
import { createProcess } from "services/process";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

const StyledCollapse = styled(Collapse)`
  margin-bottom: 20px;

  .ant-collapse-header {
    padding: 0 !important;
  }

  .ant-collapse-content-box {
    padding: 12px 0;
  }

  .ant-collapse-content-active {
    border-bottom: 1px solid rgba(0, 40, 100, 0.12);
  }

  .ant-collapse-header {
    width: fit-content;
  }
`;

const AddNewProcess = ({ data }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const showModal = () => {
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
  };

  const create = useMutation(createProcess, {
    onSuccess: async () => {
      await queryClient.refetchQueries(["list"], { active: true });
      closeModal();
    },
  });

  const handleSubmit = async () => {
    try {
      const fields = await form.validateFields();
      create.mutate(fields);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Add new proccess
      </Button>
      <Modal
        title={
          <>
            <AppstoreAddOutlined /> Add new process
          </>
        }
        okText="Save"
        visible={showAddModal}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={create.isLoading}
        cancelButtonProps={{
          disabled: create.isLoading,
        }}
        closable={!create.isLoading}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={"optional"}
          initialValues={{
            bashScript: "#!/bin/bash",
          }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={
                <>
                  <PlayCircleOutlined /> Setup
                </>
              }
              key="1"
            >
              <StyledCollapse ghost>
                <Panel
                  showArrow={false}
                  header={
                    <Button icon={<PullRequestOutlined />}>
                      Clone from Git
                    </Button>
                  }
                  key="1"
                >
                  <Form.Item
                    label="Git repository"
                    tooltip={{
                      title: "Tooltip with customize icon",
                      icon: <InfoCircleOutlined />,
                    }}
                    name="repo"
                  >
                    <Input placeholder="repository url address" />
                  </Form.Item>
                  <Form.Item
                    label="Project path"
                    tooltip={{
                      title: "Tooltip with customize icon",
                      icon: <InfoCircleOutlined />,
                    }}
                    name="path"
                  >
                    <Input placeholder={data.pwd} />
                  </Form.Item>
                  <Input.Group compact>
                    <Form.Item
                      label="Username"
                      name="username"
                      style={{
                        display: "inline-block",
                        width: "calc(50% - 8px)",
                      }}
                    >
                      <Input placeholder="username" />
                    </Form.Item>
                    <Form.Item
                      label="Password"
                      name="password"
                      style={{
                        display: "inline-block",
                        width: "calc(50% - 8px)",
                      }}
                    >
                      <Input type="password" placeholder="password" />
                    </Form.Item>
                  </Input.Group>
                  <Divider orientation="left" orientationMargin="0">
                    Setup scripts
                  </Divider>
                  <Form.Item label="Script path" name="setupScriptPath">
                    <Input placeholder={data.pwd} />
                  </Form.Item>
                  <Divider plain>or</Divider>
                  <Form.Item label="Bash script" name="bashScript">
                    <CodeEditor
                      language="shell"
                      placeholder="Please enter shell code."
                      style={{
                        fontSize: 12,
                        minHeight: 100,
                        backgroundColor: "#f5f5f5",
                        fontFamily:
                          "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                      }}
                    />
                  </Form.Item>
                </Panel>
              </StyledCollapse>
              <Form.Item
                required
                label="Process entry path"
                name="script"
                rules={[{ required: true }]}
              >
                <Input placeholder={data.pwd} />
              </Form.Item>
              <Form.Item label="Process name" name="name">
                <Input placeholder="Example" />
              </Form.Item>
            </TabPane>
            <TabPane
              tab={
                <>
                  <SettingOutlined /> Settings
                </>
              }
              key="2"
            >
              <Form.Item label="CWD" name="cwd">
                <Input placeholder={data.pwd} />
              </Form.Item>
              <Form.Item label="Args" name="args">
                <Input placeholder="-a 13 -b 12" />
              </Form.Item>
              <Form.Item label="Interpreter" name="interpreter">
                <Input placeholder="/usr/bin/node" />
              </Form.Item>
              <Form.Item label="Interpreter args" name="interpreter_args">
                <Input placeholder="–help" />
              </Form.Item>
              <Form.Item label="Node args" name="node_args">
                <Input placeholder="" />
              </Form.Item>
            </TabPane>
            <TabPane
              tab={
                <>
                  <ThunderboltOutlined /> Advanced
                </>
              }
              key="3"
            >
              <Form.Item label="Instances" name="instances">
                <Input type="number" placeholder="1" />
              </Form.Item>
              <Form.Item label="Exec mode" name="exec_mode">
                <Select defaultValue="fork">
                  <Option value="fork">Fork</Option>
                  <Option value="cluster">Cluster</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Watch" name="watch">
                <Switch defaultChecked />
              </Form.Item>
              <Form.Item label="ENV" name="env">
                <CodeEditor
                  language="json"
                  placeholder={`{ "NODE_ENV": "production" }`}
                  style={{
                    fontSize: 12,
                    minHeight: 100,
                    backgroundColor: "#f5f5f5",
                    fontFamily:
                      "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                  }}
                />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
};

export default AddNewProcess;
