import React, { useState, useEffect } from 'react';
import { getEvents, PoapEvent, getEvent, updateEvent } from '../api';
import { useAsync } from '../react-helpers';
import { Link, Switch, Route, RouteComponentProps } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { object, string } from 'yup';

export const EventsPage: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/admin/events" component={EventList} />
      <Route exact path="/admin/events/new" component={CreateEventForm} />
      <Route exact path="/admin/events/:eventId" component={EditEventForm} />
    </Switch>
  );
};

// const IP_REGEXP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const ADDRESS_REGEXP = /^0x[0-9a-fA-F]{40}$/;

const PoapEventSchema = object().shape({
  image_url: string()
    .label('Image Url')
    .required()
    .url(),
  event_url: string()
    .label('Website')
    .url(),
  signer_ip: string()
    .label('Signer Url')
    .url()
    .nullable(),
  signer: string()
    .matches(ADDRESS_REGEXP, 'Must be a valid Ethereum Address')
    .nullable(),
});

const CreateEventForm: React.FC = () => {
  return <>Hola mundo</>;
};

const EditEventForm: React.FC<
  RouteComponentProps<{
    eventId: string;
  }>
> = ({ location, match }) => {
  const [event, setEvent] = useState<null | PoapEvent>(null);

  useEffect(() => {
    const fn = async () => {
      if (location.state) {
        setEvent(location.state);
      } else {
        const event = await getEvent(match.params.eventId);
        if (event) {
          if (event.signer == null) {
            event.signer = '';
          }
          if (event.signer_ip == null) {
            event.signer_ip = '';
          }
        }
        setEvent(event);
      }
    };
    fn();
  }, [location, match]);

  if (!event) {
    return <div>Loading...</div>;
  }

  console.log(event);
  return (
    <Formik
      initialValues={event}
      validationSchema={PoapEventSchema}
      onSubmit={async (values, actions) => {
        try {
          actions.setSubmitting(true);
          await updateEvent(values);
        } finally {
          actions.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, isValid, dirty }) => (
        <Form>
          <h2>
            {event.name} - {event.year}
          </h2>

          <div className="bk-form-row">
            <label>Fancy ID:</label>
            <Field type="text" disabled name="fancy_id" />
          </div>
          <div className="bk-form-row">
            <label>Description:</label>
            <Field type="text" disabled name="description" />
          </div>
          <div className="bk-group">
            <div className="bk-form-row">
              <label>Start Date:</label>
              <Field type="text" disabled name="start_date" />
            </div>
            <div className="bk-form-row">
              <label>End Date:</label>
              <Field type="text" disabled name="end_date" />
            </div>
          </div>
          <div className="bk-group">
            <div className="bk-form-row">
              <label>City:</label>
              <Field type="text" disabled name="city" />
            </div>
            <div className="bk-form-row">
              <label>Country:</label>

              <Field type="text" disabled name="country" />
            </div>
          </div>
          <div className="bk-form-row">
            <label>Website:</label>
            <Field type="text" name="event_url" />
            <ErrorMessage name="event_url" component="div" className="bk-error" />
          </div>
          <div className="bk-form-row">
            <label>Image Url:</label>
            <Field type="text" name="image_url" />
            <ErrorMessage name="image_url" component="div" className="bk-error" />
          </div>
          <div className="bk-form-row">
            <label>Signer Url:</label>
            <Field type="text" name="signer_ip" />
            <ErrorMessage name="signer_ip" component="div" className="bk-error" />
          </div>
          <div className="bk-form-row">
            <label>Signer Address:</label>
            <Field type="text" name="signer" />
            <ErrorMessage name="signer" component="div" className="bk-error" />
          </div>
          <button className="btn" type="submit" disabled={isSubmitting || !isValid || !dirty}>
            Save
          </button>
        </Form>
      )}
    </Formik>
  );
};

const EventList: React.FC = () => {
  const [events, fetchingEvents, fetchEventsError] = useAsync(getEvents);

  return (
    <>
      <h2>Events</h2>
      <button className="bk-btn" style={{ margin: '30px 0px' }}>
        Create New
      </button>
      {fetchingEvents ? (
        <div>Fetching Events...</div>
      ) : fetchEventsError || events == null ? (
        <div>There was a problem fetching events</div>
      ) : (
        <div>
          {events.map(e => (
            <EventRow key={e.id} event={e} />
          ))}
        </div>
      )}
    </>
  );
};

const EventRow: React.FC<{ event: PoapEvent }> = ({ event }) => {
  return (
    <div className="bk-eventrow">
      <div>{event.name}</div>
      <div>
        <Link to={{ pathname: `/admin/events/${event.fancy_id}`, state: event }}>
          <button className="bk-btn">Edit</button>
        </Link>
      </div>
    </div>
  );
};
