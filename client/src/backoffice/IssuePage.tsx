import { ErrorMessage, Field, Form, Formik, FormikActions, FieldProps } from 'formik';
import React from 'react';
import * as yup from 'yup';
import { getEvents, mintEventToManyUsers, PoapEvent, mintUserToManyEvents } from '../api';
import classNames from 'classnames';
import { SubmitButton } from '../components/SubmitButton';

interface IssueForEventPageState {
  events: PoapEvent[];
  initialValues: IssueForEventFormValues;
}

interface IssueForEventFormValues {
  eventId: number;
  addressList: string;
}

const IssueForEventFormValueSchema = yup.object().shape({
  eventId: yup
    .number()
    .required()
    .min(1),
  addressList: yup
    .string()
    .required()
    .matches(/^0x[0-9a-fA-F]{40}(\n0x[0-9a-fA-F]{40})*\n*$/, 'Not a valid address or address list'),
});

export class IssueForEventPage extends React.Component<{}, IssueForEventPageState> {
  state: IssueForEventPageState = {
    events: [],
    initialValues: {
      eventId: 0,
      addressList: '',
    },
  };

  async componentDidMount() {
    const events = await getEvents();

    this.setState(old => {
      return {
        ...old,
        events,
        initialValues: {
          ...old.initialValues,
          eventId: events[1].id,
        },
      };
    });
  }

  onSubmit = async (
    values: IssueForEventFormValues,
    actions: FormikActions<IssueForEventFormValues>
  ) => {
    const addresses = values.addressList
      .trim()
      .split('\n')
      .map(adr => adr.trim());
    try {
      actions.setStatus(null);
      await mintEventToManyUsers(values.eventId, addresses);
      actions.setStatus({
        ok: true,
        msg: `All Done`,
      });
    } catch (err) {
      actions.setStatus({
        ok: false,
        msg: `Mint Failed: ${err.message}`,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  render() {
    if (this.state.events.length === 0) {
      return <div className="bk-msg-error">No Events</div>;
    }

    return (
      <div>
        <Formik
          initialValues={this.state.initialValues}
          onSubmit={this.onSubmit}
          validationSchema={IssueForEventFormValueSchema}
          render={({ dirty, isValid, isSubmitting, status }) => {
            return (
              <Form>
                <div className="bk-form-row">
                  <label htmlFor="eventId">Choose Event:</label>
                  <Field name="eventId" component="select">
                    {this.state.events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="eventId" component="p" className="bk-error" />
                </div>
                <div className="bk-form-row">
                  <label htmlFor="addressList">Beneficiaries Addresses</label>
                  <Field
                    name="addressList"
                    render={({ field, form }: FieldProps) => (
                      <textarea
                        rows={10}
                        cols={24}
                        placeholder="Write a list of addresses. Each Separated by a new line"
                        className={classNames(!!form.errors[field.name] && 'error')}
                        {...field}
                      />
                    )}
                  />
                  {}
                  <ErrorMessage name="addressList" component="p" className="bk-error" />
                </div>
                {status && (
                  <div className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</div>
                )}
                <SubmitButton
                  text="Mint"
                  isSubmitting={isSubmitting}
                  canSubmit={isValid && dirty}
                />
              </Form>
            );
          }}
        />
      </div>
    );
  }
}

interface IssueForUserPageState {
  events: PoapEvent[];
  initialValues: IssueForUserFormValues;
}

interface IssueForUserFormValues {
  eventIds: number[];
  address: string;
}

const IssueForUserFormValueSchema = yup.object().shape({
  eventIds: yup
    .array()
    .of(yup.number().min(1))
    .required()
    .min(1),
  address: yup
    .string()
    .required()
    .matches(/^0x[0-9a-fA-F]{40}$/, 'Not a valid address'),
});

export class IssueForUserPage extends React.Component<{}, IssueForUserPageState> {
  state: IssueForUserPageState = {
    events: [],
    initialValues: {
      eventIds: [],
      address: '',
    },
  };

  async componentDidMount() {
    const events = await getEvents();

    this.setState({ events });
  }

  onSubmit = async (
    values: IssueForUserFormValues,
    actions: FormikActions<IssueForUserFormValues>
  ) => {
    try {
      actions.setStatus(null);
      await mintUserToManyEvents(values.eventIds, values.address);
      actions.setStatus({
        ok: true,
        msg: `All Done`,
      });
    } catch (err) {
      actions.setStatus({
        ok: false,
        msg: `Mint Failed: ${err.message}`,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  render() {
    if (this.state.events.length === 0) {
      return <div className="bk-msg-error">No Events</div>;
    }

    console.log(this.state.initialValues);
    return (
      <div>
        <Formik
          initialValues={this.state.initialValues}
          onSubmit={this.onSubmit}
          validationSchema={IssueForUserFormValueSchema}
          render={({ dirty, isValid, isSubmitting, status }) => {
            return (
              <Form>
                <div className="bk-form-row">
                  <label>Choose Events:</label>
                  <div>
                    {this.state.events.map(event => (
                      <Checkbox
                        key={event.id}
                        name="eventIds"
                        value={event.id}
                        label={event.name}
                      />
                    ))}
                  </div>
                  <ErrorMessage name="eventIds" component="p" className="bk-error" />
                </div>
                <div className="bk-form-row">
                  <label htmlFor="address">Beneficiary Address</label>
                  <Field
                    name="address"
                    render={({ field, form }: FieldProps) => (
                      <input
                        type="text"
                        placeholder="0x811a16ebf03c20d9333ff5321372d86da9ad1f2e"
                        className={classNames(!!form.errors[field.name] && 'error')}
                        {...field}
                      />
                    )}
                  />
                  <ErrorMessage name="address" component="p" className="bk-error" />
                </div>
                {status && (
                  <div className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</div>
                )}
                <SubmitButton
                  text="Mint"
                  isSubmitting={isSubmitting}
                  canSubmit={isValid && dirty}
                />
              </Form>
            );
          }}
        />
      </div>
    );
  }
}

type CheckboxProps = {
  name: string;
  value: any;
  label: string;
};

const Checkbox: React.FC<CheckboxProps> = props => {
  return (
    <Field name={props.name}>
      {({ field, form }: FieldProps) => (
        <label>
          <input
            type="checkbox"
            checked={field.value.includes(props.value)}
            onChange={() => {
              if (field.value.includes(props.value)) {
                const nextValue = field.value.filter((value: any) => value !== props.value);
                form.setFieldValue(props.name, nextValue);
              } else {
                const nextValue = field.value.concat([props.value]);
                form.setFieldValue(props.name, nextValue);
              }
            }}
          />
          {props.label}
        </label>
      )}
    </Field>
  );
};
