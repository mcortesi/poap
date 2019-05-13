import { ErrorMessage, Field, Form, Formik, FormikActions } from 'formik';
import React from 'react';
import { number, object, string } from 'yup';
import { getEvents, mintTokenBatch, PoapEvent } from '../api';

export interface IssuePageState {
  events: PoapEvent[];
  initialValues: FormValues;
}

interface FormValues {
  eventId: number;
  addressList: string;
}

const FormValueSchema = object().shape({
  eventId: number()
    .required()
    .min(1),
  addressList: string()
    .required()
    .matches(/^0x[0-9a-fA-F]{40}(\n0x[0-9a-fA-F]{40})*\n*$/, 'Not a valid address or address list'),
});

export class IssuePage extends React.Component<{}, IssuePageState> {
  state: IssuePageState = {
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

  onSubmit = async (values: FormValues, actions: FormikActions<FormValues>) => {
    const addresses = values.addressList
      .trim()
      .split('\n')
      .map(adr => adr.trim());
    try {
      await mintTokenBatch(values.eventId, addresses);
    } catch (err) {
      actions.setError('Exploto Todo!');
    } finally {
      actions.setSubmitting(false);
    }
  };

  render() {
    if (this.state.events.length === 0) {
      return <div>No Events</div>;
    }

    return (
      <div>
        <Formik
          initialValues={this.state.initialValues}
          onSubmit={this.onSubmit}
          validationSchema={FormValueSchema}
          render={({ errors, status, touched, isSubmitting }) => {
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
                  <ErrorMessage name="eventId" component="div" className="bk-error" />
                </div>
                <div className="bk-form-row">
                  <label htmlFor="addressList">Beneficiaries Addresses</label>
                  <Field
                    name="addressList"
                    render={({ field /* _form */ }: any) => (
                      <textarea
                        {...field}
                        placeholder="Write a list of addresses. Each Separated by a new line"
                        rows="10"
                        cols="24"
                      />
                    )}
                  />
                  <ErrorMessage name="addressList">{msg => <div>{msg}</div>}</ErrorMessage>
                </div>
                {isSubmitting && 'Working....'}
                <button className="btn" type="submit" disabled={isSubmitting}>
                  Mint
                </button>
              </Form>
            );
          }}
        />
      </div>
    );
  }
}
